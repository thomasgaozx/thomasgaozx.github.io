# Git Commit Symbols

```bash
git show $COMMIT_ID # a long hash
git show c82a22c3 # first few characters are sufficient

git show HEAD # the tip of current branch
git show feature # the tip of 'feature' branch
```
To select a parent commit:
```bash
git show HEAD~1
git show HEAD^ # the parent of HEAD

git show HEAD~2
git show HEAD^^ # the grandparent of HEAD

git show HEAD^1 # first parent (same as HEAD^)
git show HEAD^2 # second parent (upstream branch)
```

# Git Rebase
Normally git rebase is not needed, knowing git rebase and how it works could make the gitk tree much prettier, and save a lot of headaches.

To learn more about git rebase, see Additional Readings.

## Elementary Git Rebase
Assume you're on feature branch, you want to _rebase_ to the latest commit of the develop branch.
```
git rebase develop
git rebase develop feature
```
Assume you want to _rebase_ the feature branch from the develop branch onto master branch:
```
git rebase --onto master develop feature
```

## Using Git Rebase to Delete Commit
If you are on a feature branch and you wish to remove commit F and G from the below diagram
```
E---F---G---H---I---J  feature (before rebase)
E---H---I---J  feature (after rebase)
```
You could do:
```git
git rebase --onto feature~5 feature~3 feature
```

## Multiple People Collaborate on the Same Branch
Fetching works the same as if you're on an individual branch, but before you push anything, do:
```
git pull --rebase
git push
```

## Git Rebase Conflict Resolution
The commits are rewinded and collected in a stack. These commits are then popped one by one onto the new upstream. When a conflict occurs, resolve the conflict on the spot, then do:
```
git add .
git rebase --continue
```
If you decides to be a loser and give up, do:
```
git rebase --abort
```

# Git Stash
```bash
git stash
git stash apply
```
If you want to name a stash.
```bash
git stash save $STASH_NAME # name a stash
git stash apply $STASH_NAME # apply the named stash
```
Apply a particular stash:
```bash
$ git stash list
stash@{0}: WIP on master: 049d078 second stash
stash@{1}: WIP on master: c264051 initial stash
$ git stash apply stash@{1}
```
Remove all stashes:
```bash
git stash clear
```
# Hunk Manipulations

The `-p` option will allow you to interactively select hunks. 


## Selectively Reverse Hunks
```
git checkout -p $COMMIT_ID -- $FILE_PATH
```
The `$COMMIT_ID` specifies the commit that you want to *take the file state from*. This means that all changes made between `$COMMIT_ID` and current commit are checked. Note that the first command excludes the changes made in `$COMMIT_ID`.

You are usually given these options `[y,n,q,a,d,s,e,?]`? The details are in the interactive manual, but below are all you need to worry about:
- `s` - split the current hunk into smaller hunks
- `e` - manually edit the current hunk

## Selectively Stage Hunks
```bash
git add -p
```
Alternatively, you can do:
```bash
git add -i
```
In the interactive prompt, type `5` or `p` for patch. 

## Selectively Unstage Hunks
```bash
git reset -p
```

# Additional Readings
#### Git Commit Symbols
1. https://git-scm.com/docs/gittutorial
#### Git Rebase
1. https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase
2. https://git-scm.com/docs/git-rebase
3. https://linux.die.net/man/1/git-rebase
#### Manipulating Hunks
1. https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging
2. https://stackoverflow.com/questions/4248237/how-do-i-reverse-a-specific-hunk-of-a-commit-in-git
3. https://stackoverflow.com/questions/7336966/git-interactive-unstage 

