import Git, {Repository} from "nodegit"

export const autoCommitName="Restructured Notes"
export const autoCommitEmail="app@restructurednotes.com"

function getSystemSignature() {
    return Git.Signature.now(autoCommitName, autoCommitEmail)
}

export async function initRepoAndCommitAll(path: string) {
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
            "Initial commit",
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

export async function openRepo(path:string) {
    return await Repository.open(path)
}

export async function commitConfigFileWithSystemSignature(repoPath: string) {
    try {
        const repo = await Git.Repository.open(repoPath)
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

export async function isConfigModified(repoPath: string) {
    try {
        const repo = await Git.Repository.open(repoPath)
        const status = await Git.Status.file(repo, "config.yml")
        return status===Git.Status.STATUS.WT_MODIFIED
    } catch (e) {
        throw e
    }
}

export async function tag(repo:any){

}

export {Git}