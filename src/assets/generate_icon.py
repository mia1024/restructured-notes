#!/usr/bin/python3
import os
import sys
import shutil

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if not os.path.exists('icon.svg'):
    print("icon.svg does not exist",file=sys.stderr)
    sys.exit(1)


if os.path.exists("icon.iconset"):
    shutil.rmtree("icon.iconset")
os.mkdir("icon.iconset")
os.chdir("icon.iconset")

for width in (16,32,64,128,256,512):
    print(f"Generating {width}px width icon...")
    assert os.system(f"convert -background none -density {min(600,width)} -resize {width}x{width} ../icon.svg icon_{width}x{width}.png")==0
    assert os.system(f"convert -background none -density {min(600,width)} -resize {width}x{width} ../icon.svg icon_{width//2}x{width//2}@2x.png")==0

os.system(f"convert -background none -density 600 -resize 1024x1024 ../icon.svg icon_1024x1024.png")
shutil.copy("icon_1024x1024.png","../icon.png")
os.chdir("..")

print("converting to icns...")
assert os.system("iconutil -c icns icon.iconset icon.icns")==0

print("cleaning up...")
shutil.rmtree("icon.iconset")

