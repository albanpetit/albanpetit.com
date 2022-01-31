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
## Static site generator
### Docusaurus
{{< image src="https://docusaurus.io/img/docusaurus.svg" position="left" >}}
Docusaurus is a Facebook dev team project for easily building, deploying, and maintaining open source project websites.

This website is running with the alpha release Docusaurus : Docusaurus 2.
Docusaurus 1 used to be a pure documentation site generator. Docusaurus 2, was rebuilt, allowing for more customizability, so now it can feat to content-driven websites (Documentation, Blogs, Product Landing and Marketing Pages, etc) extremely fast.
#### Install
The easiest way to install Docusaurus is to use the command line tool that helps you scaffold a skeleton Docusaurus website :
```bash
npx @docusaurus/init@next init [name] [template]
Replace [name] and [template].
```
#### Development server
Command to run the dev server :
```bash
cd [name]
yarn start
```
By default, a browser window will open at `http://localhost:3000`.
#### Build
Docusaurus is a static website generator so we need to build the website into a directory of static contents and put it on a web server so that it can be viewed. To build the website :
```bash
yarn run build
```
#### Gitlab Pages
{{< image src="https://fabacademy.org/2020/labs/lamachinerie/students/alban-petit/img/logoGitlab.png" position="left" >}}
- **Continuous Integration** is the practice of merging all the code that is being produced by developers. The merging usually takes place several times a day in a shared repository. From within the repository, or production environment, building and automated testing are carried out that ensure no integration issues and the early identification of any problems.
- **Continuous Delivery** adds that the software can be released to production at any time, often by automatically pushing changes to a staging system.
- **Continuous Deployment** goes further and pushes changes to production automatically.

This project is put into production with each modification of the **Master branch** of the gitlab repository.
So I use for this the integrated solution to gitlab, **Gitlab CI** to do this.

So each time a commit is sent, a docker container instance will be launched by gitlab to build the application.
This procedure is described in the yaml file: `.gitlab-ci.yml`.

The container will therefore build the application and transfer the final files from the application to a second feature of gitlab, **Gitlab Pages** which allows hosting of static websites.

The `.gitlab-ci.yml` of this **Docusaurus** project : 

```yaml
image: node:9.11.1

pages:
  script:
    - ls -al
    - yarn install
    - yarn build
    - mkdir ./public
    - mv ./build/* ./public
  artifacts:
    paths:
      - public
  only:
    - master
```
### Hugo
#### Install
The quickest way to install hugo is to download the appropriate binary version on the official github and put in `/usr/local/bin` or any directory in yout `PATH`. But better way to install is to use a package manager so :
- macOs : 
```bash
brew install hugo
```
- linux :
```bash
sudo apt install hugo
```
- windows with `chocolatey` :
```bash
choco install hugo -confirm
```
> Fun fact, on my mac hugo work fine, but on the linux side, the development server won't run, after some research multiple version of Hugo are available, to build and minify `sccs` the extended version is needed, so to install it : 
> ```bash
> wget https://github.com/gohugoio/hugo/releases/download/v0.88.1/hugo_extended_0.88.1_Linux-64bit.deb
> sudo dpkg --install hugo_extended_0.88.1_Linux-64bit.deb
> ```
> The same problem occur on windows : [Hugo extended on windows](https://gohugo.io/getting-started/installing/#windows)
#### Development server
Command to run the dev server :
```bash
hugo server
```
By default, a browser window will open at `http://localhost:1313`.
#### Build
```bash
hugo
```