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
## Additional Readings
1. https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase
2. https://git-scm.com/docs/git-rebase
3. https://linux.die.net/man/1/git-rebase
