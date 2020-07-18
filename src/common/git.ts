import Git, {Repository} from "nodegit"
import {existsSync, lstatSync, rmdirSync} from "fs";
import {join} from "path";

export const autoCommitName = "Restructured Notes"
export const autoCommitEmail = "app@restructurednotes.com"

function getSystemSignature() {
    return Git.Signature.now(autoCommitName, autoCommitEmail)
}

export async function initRepoAndCommitAll(path: string, message?: string, force=false) {
    if (force){
        if (existsSync(join(path,'.git'))&&lstatSync(join(path,'.git')).isDirectory())
            rmdirSync(join(path,'.git'),{recursive:true})
    }
    try {
        const repo = await Git.Repository.init(path, 0)
        const index = await repo.index()
        await index.addAll(".")
        await index.write()
        const tree = await index.writeTree()
        const commit = await repo.createCommit(
            "HEAD",
            getSystemSignature(),
            getSystemSignature(),
            message ?? "Initial commit",
            tree,
            [] // initial commit doesn't have a parent
        )

        // rename the default branch from master to main
        const main = await repo.createBranch("main", commit, false)
        await repo.checkoutBranch(main)
        const master = await repo.getBranch("master")
        await Git.Branch.delete(master)
        return repo
    } catch (e) {
        throw (e)
    }
}

export async function openRepo(path: string) {
    try {
        return await Repository.open(path)
    } catch (e) {
        throw e
    }
}

export async function tagHEAD(repo: string | Repository, name: string) {
    try {
        if (!(repo instanceof Repository))
            repo = await openRepo(repo)
        let commit = await repo.getHeadCommit()
        return await repo.createLightweightTag(commit.id(), name)
    } catch (e) {
        throw e
    }
}

export async function commitConfigFileWithSystemSignature(repo: string | Repository) {
    try {
        if (!(repo instanceof Repository))
            repo = await openRepo(repo)
        return await repo.createCommitOnHead(
            ["config.yml"],
            getSystemSignature(),
            getSystemSignature(),
            "Updated config.yml"
        )
    } catch (e) {
        throw e
    }
}

export async function commitConfigFileAndTag(repo: string | Repository) {
    try {
        if (!(repo instanceof Repository))
            repo = await openRepo(repo)
        let commit = await repo.createCommitOnHead(
            ["config.yml"],
            getSystemSignature(),
            getSystemSignature(),
            "Updated config.yml"
        )
        try {
            await repo.deleteTagByName('LastWorkingConfig')
        } catch (e) {
            if (!e.message.match(/reference .+ not found/gi))
                throw e
        }
        await repo.createLightweightTag(commit, 'LastWorkingConfig')
    } catch (e) {
        throw e
    }
}

export async function isConfigModified(repo: string | Repository) {
    try {
        if (!(repo instanceof Repository))
            repo = await openRepo(repo)
        const status = await Git.Status.file(repo, "config.yml")
        return status === Git.Status.STATUS.WT_MODIFIED
    } catch (e) {
        throw e
    }
}

export async function getGlobalUsername():Promise<string|undefined> {
    try {
        let path = await Git.Config.findGlobal()
        let config = await Git.Config.openOndisk(path)
        return (await config.getEntry('user.name')).value()
    } catch (e) {
        return undefined
    }
}

export async function getGlobalEmail():Promise<string|undefined>{
    try {
        let path = await Git.Config.findGlobal()
        let config = await Git.Config.openOndisk(path)
        return (await config.getEntry('user.email')).value()
    } catch (e) {
        return undefined
    }
}

export async function getGlobalConfigPath():Promise<string>{
    try{
        return await Git.Config.findGlobal()
    } catch (e) {
        return ''
    }
}

export {Git}