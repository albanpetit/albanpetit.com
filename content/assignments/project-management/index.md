---
title: Project management
date: 2022-01-25
slug: project-management
image: "https://miro.medium.com/max/1838/0*cDOBWTUhmdzmVkTd"
description: Week 1
---

First of all,


## Git
{{< image src="https://fabacademy.org/2020/labs/lamachinerie/students/alban-petit/img/logoGit.png" position="left" >}}
Git is a version control system, widely adopted in the software development and opensource community. Multiple web platform provide free or lowcost solution to host repository, Github, Gitlab, Bitbucket...

[More informations about git here](https://git-scm.com/doc)
### Setup git
#### Install git
Before starting anything, git is needed to deal with repository, so, let's install it. Even if it's installed, it's a good idea to update it.
- macOs :
    On Mac, the easiest way is to install it with `Xcode` command line tool, you can do this simply by trying to run a git command from the terminal :
    ```bash
    git --version
    ```
    If you don't have it installed already, it will prompt you to install it.
- linux:
    On linux you can use `apt`, it's a command line interface for the package management system on debian based distribution, so with a terminal, run :
    ```bash
    sudo apt update
    sudo apt install git
    ```
- windows ( best idea is to install linux )
    Managing windows software can be really annoying and time-consuming, some software can resolve this problem like `chocolatey`, so with powershell :
    ```powershell
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    ```
    Now you can install git, also with powershell :
    ```powershell
    choco install git
    ```
#### Generate ssh key
To create a new SSH key pair:
1. Open a terminal
2. Generate a new SSH key pair:
    ```bash
    ssh-keygen -C "email@example.com"
    ```
3. Copy the ssh **public key** :
    - macOs :
        ```bash
        pbcopy < ~/.ssh/id_rsa.pub
        ```
    - linux (require xclip**) :
        ```bash
        xclip -sel clip < ~/.ssh/id_rsa.pub
        ```
    - windows git bash :
        ```bash
        cat ~/.ssh/id_rsa.pub | clip
        ```
** Command to install xclip, debian/ubuntu :
```bash
sudo apt install xclip
```
#### Define git user parameters
##### Git indentity
The first thing you should do when you install Git is to set your user name and email address. This is important because every Git commit uses this information, and it’s immutably baked into the commits you start creating:
```bash
git config --global user.name "firstname lastname"
git config --global user.email email@example.com
```
You need to do this only once if you pass the --global option, because then Git will always use that information for anything you do on that system. If you want to override this with a different name or email address for specific projects, you can run the command without the --global option when you’re in that project.
##### Git default editor
you can configure the default text editor that will be used when Git needs you to type in a message. If not configured, Git uses your system’s default editor.
If you want to use a different text editor, such as Emacs, you can do the following:
```bash
git config --global core.editor emacs
```
On a Windows system, if you want to use a different text editor, you must specify the full path to its executable file. This can be different depending on how your editor is packaged.
##### Review the configuration
Git provide a command to check the configuration settings :
```bash
git config --list
```
### Git command line
Here is a list of basic git command to interact with repostories.
#### Git clone 
`git clone` allow to make a local copy of an online repository. See below how to use it :
1. Open a terminal
2. Point at the folder of your choice :
    ```bash
    cd /ideal/path
    ```
3. Clone the repo with the command “git clone”, two solutions with ssh or http:
    If you have a ssh key configured with the gitlab of the fabacademy :
    ```bash
    git clone git@gitlab.fabcloud.org:academany/fabacademy/2020/labs/lamachinerie/students/alban-petit.git
    ```
    Else:
    ```bash
    git clone https://gitlab.fabcloud.org/academany/fabacademy/2020/labs/lamachinerie/students/alban-petit.git
    ```
4. Now, you can run ls command to list the fils in the current directory :
    ```bash
    ls -al
    ```
#### Git pull
Incorporates changes from a remote repository into the current branch.
1. Go to a git repository in your local files :
    ```bash
    cd /my/awesome/repository
    ```
2. Now you can update your local files with changes available online :
    ```bash
    git pull
    ```
#### Git add
This command updates the index using the current content found in the working tree, to prepare the content staged for the next commit.
- To take a snapshot of the contents of all files under the current directory :
    ```bash
    git add .
    ```
- To take a snapshot of all files :
    ```bash
    git add -A
    ```
#### Git commit
`git commit` updates the index using the current content found in the working tree, to prepare the content staged for the next commit.
```bash
git commit -m "message"
```
You can replace "message" with your commit message. For example: ":tada: initial commit". 
A second `-m` parameter allow you to add a second message to the commit, the first one must be short, but the second allows to go further in the explanations concerning the modifications made with this commit, see below :
```bash
git commit -m "message" -m "full description about the modifications"
```
#### Git push
Updates remote repository using local snapshot of the content.
```bash
git push
```
### VScode
{{< image src="https://fabacademy.org/2020/labs/lamachinerie/students/alban-petit/img/logoVSCode.png" position="left" >}}
As I said before, I personally use VScode to program and work on my project. 

VScode have Git possibilities integrated, and you can make all the commit/push/pull command directly inside it. Just click on the icon named "Souce Control" in the left panel inside VScode, and you will find all the command to commit/push/pull your modifications.
![](https://code.visualstudio.com/assets/docs/editor/versioncontrol/scm-providers-list.png)
### Commit name convention
Good commit messages serve at least three important purposes:
- To speed up the reviewing process.
- To help us write a good release note.
- To help the future/other maintainers of the project.

So you can structure your commit message like this:
```
<type> <sujet>

<description>
```
- **Type** defines the type of commit
    - **build**: build solution (gulp, webpack, npm)
    - **ci**: Continuous integration (Travis, Circle, BrowserStack, SauceLabs)
    - **docs**: Documentation
    - **feat**: Add feature
    - **fix**: bug fix
    - **perf**: Performance improvement
    - **refactor**: Code changement which does not change the usage
    - **style**: Style modification
    - **test**: Tests modification
- **Sujet** contains a brief description of the changes
    Using the present imperative ("change", not "changed" or "changes")
    Without capital letter at the beginning
    No "." at the end of the description
- **Description** allows to detail in more detail the motivations behind the change. The rules are the same as for the Subject part.

To define the type of commit, you can use another solution : [Gitmoji](https://github.com/carloscuesta/gitmoji)
## Docusaurus
## Hugo