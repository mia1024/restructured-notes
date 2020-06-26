import Git from 'nodegit'

export const autoCommitName='Restructured Notes'
export const autoCommitEmail='app@restructurednotes.com'

function getSystemSignature() {
    return Git.Signature.now(autoCommitName, autoCommitEmail)
}

export async function initRepoAndCommitAll(path: string) {
    try {
        let repo = await Git.Repository.init(path, 0)
        let index = await repo.index()
        await index.addAll('.')
        await index.write()
        let tree = await index.writeTree()
        let commit = await repo.createCommit(
            "HEAD",
            getSystemSignature(),
            getSystemSignature(),
            'Initial commit',
            tree,
            [] // initial commit doesn't have a parent
        )

        // rename the default branch from master to main
        let main = await repo.createBranch("main", commit, false)
        await repo.checkoutBranch(main)
        let master = await repo.getBranch("master")
        await Git.Branch.delete(master)

    } catch (e) {
        throw (e)
    }
}

export async function commitConfigFileWithSystemSignature(repoPath: string) {
    try {
        let repo = await Git.Repository.open(repoPath)
        return await repo.createCommitOnHead(
            ['config.yml'],
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
        let repo = await Git.Repository.open(repoPath)
        let status = await Git.Status.file(repo, 'config.yml')
        return status===Git.Status.STATUS.WT_MODIFIED
    } catch (e) {
        throw e
    }
}

export {Git}