#!/usr/bin/env python3

import os
import platform
import sys
import multiprocessing as mp, json, shutil, traceback
import subprocess
import hashlib

CACHE_DIRECTORY = '.bin_cache'
TO_INSTALL = (
    ('nodegit', 'node_modules/nodegit/build/Release/nodegit.node'),
    ('font-scanner', 'node_modules/font-scanner/build/Release/fontmanager.node'),
    ('canvas', 'node_modules/canvas/build/Release/canvas.node')
)

package = json.load(f := open('package.json'))
f.close()

if os.path.exists(os.path.join(CACHE_DIRECTORY, 'lock.json')):
    lock = json.load(f := open(os.path.join(CACHE_DIRECTORY, 'lock.json')))
    f.close()
else:
    lock = {}


class InstallationError(Exception): pass


def print_green(text, *args, **kwargs):
    print(f'\033[92m{text}\033[00m', *args, **kwargs)


def print_red(text, *args, **kwargs):
    print(f'\033[91m{text}\033[00m', *args, **kwargs)


def print_yellow(text, *args, **kwargs):
    print(f"\033[93m{text}\033[00m", *args, **kwargs)


def write_hash(name, binary_path):
    f = open(os.path.join('node_modules', name, '.rebuilt-for-electron'), 'w+')
    
    if md5 := shutil.which('md5'):
        f.write(subprocess.run([md5, binary_path], encoding='utf8', capture_output=True).stdout)
    elif md5 := shutil.which('md5sum'):
        f.write(subprocess.run([md5, binary_path], encoding='utf8', capture_output=True).stdout)
    else:
        hasher = hashlib.md5()
        hasher.update(open(binary_path, 'rb').read())
        f.write(hasher.hexdigest())
    f.close()


def install_binary(name: str, binary_path: str, target='8.3.3'):
    try:
        print(f'{f"[{name}]":20} Installing binary...')
        version = package['dependencies'].get(name, None)
        if version is None:
            version = package['devDependencies'][name]
        
        if cached_version := lock.get(name, None):
            if cached_version == version:
                os.makedirs(os.path.dirname(binary_path), exist_ok=True)
                shutil.copy(os.path.join(CACHE_DIRECTORY, name), binary_path)
                write_hash(name, binary_path)
                print_green(f'{f"[{name}]":20} Installed from cache')
                return name, version
        
        print_yellow(f'{f"[{name}]":20} Cached binary not found. Compiling from source...')
        command = f"npm rebuild {name} --target={target} --runtime=electron --dist-url='https://atom.io/download/electron' --update-binary"
        proc = subprocess.run(command, shell=True, encoding='utf8', capture_output=True)
        if proc.returncode != 0:
            print_red(f'{f"[{name}]":20} compilation error!')
            print(proc.stdout)
            print(proc.stderr, file=sys.stderr)
            raise InstallationError(f'Cannot install {name}')
        
        write_hash(name, binary_path)
        shutil.copy(binary_path, os.path.join(CACHE_DIRECTORY, name))
        print_green(f'{f"[{name}]":20} Compilation succeeded')
    except:
        raise Exception(traceback.format_exc())
    return name, version


def install_fibers():
    try:
        if platform.system() == 'Darwin':
            binary_path='node_modules/fibers/bin/darwin-x64-76/fibers.node'
        elif platform.system()=='Linux':
            binary_path='node_modules/fibers/bin/linux-x64-76-glibc/fibers.node'
            
        name='fibers'
        
        print(f'{f"[{name}]":20} Installing binary...')
        version = package['devDependencies']['fibers']
        
        
        if cached_version := lock.get(name, None):
            if cached_version == version:
                os.makedirs(os.path.dirname(binary_path), exist_ok=True)
                shutil.copy(os.path.join(CACHE_DIRECTORY, name), binary_path)
                write_hash(name, binary_path)
                print_green(f'{f"[{name}]":20} Installed from cache')
                return name, version
        print_yellow(f'{f"[{name}]":20} Cached binary not found. Compiling from source...')
        os.chdir('node_modules/fibers')
        if platform.system() == 'Darwin':
            proc=subprocess.run('../electron/dist/Electron.app/Contents/MacOS/Electron build',
                           shell=True,
                           capture_output=True,
                           encoding='utf8'
                           )
        elif platform.system() == 'Linux':
            proc=subprocess.run('../electron/dist/electron build',
                                shell=True,
                                capture_output=True,
                                encoding='utf8'
                                )
        os.chdir('../..')
        
        if proc.returncode != 0:
            print_red(f'{"fibers":20} compilation error!')
            print(proc.stdout)
            print(proc.stderr, file=sys.stderr)
            raise InstallationError('Cannot install fibers')
        
        write_hash(name,binary_path)
        shutil.copy(binary_path, os.path.join(CACHE_DIRECTORY, name))
        print_green(f'{f"[{name}]":20} Compilation succeeded')
        
    except:
        raise Exception(traceback.format_exc())
    return name,version
    
    


def success_cb(res):
    lock[res[0]] = res[1]


def error_cb(exc):
    print(exc, file=sys.stderr)


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    os.makedirs(CACHE_DIRECTORY, exist_ok=True)
    
    pool = mp.Pool()
    for target in TO_INSTALL:
        pool.apply_async(install_binary, target, callback=success_cb, error_callback=error_cb)
    pool.apply_async(install_fibers,callback=success_cb,error_callback=error_cb)
    pool.close()
    pool.join()
    
    json.dump(lock, f := open(os.path.join(CACHE_DIRECTORY, 'lock.json'), 'w+'), indent=4)
    f.close()
