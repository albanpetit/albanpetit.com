# albanpetit.com
[![github-pages](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml)
[![pages-build-deployment](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/pages/pages-build-deployment)


# Contribution

## Requirements

Before you start, make sure you have installed Hugo extended version. For more information, see Hugo's documentation.

This website theme uses SCSS and TypeScript, that's why Hugo extended version is required. If you are using a non-extended Hugo installation, you will get the following error :
```bash
Error: Error building site: TOCSS: failed to transform "scss/style.scss" (text/x-scss): this feature is not available in your current Hugo version
```
Once you have installed Hugo, you can check the version by running the following command:
```bash
hugo version
```
Which should output something like this (the version number may be different), notice the extended keyword:
```
hugo v0.102.3-b76146b129d7caa52417f8e914fc5b9271bf56fc+extended windows/amd64 BuildDate=2022-09-01T10:16:19Z VendorInfo=gohugoio
```
The minimum required Hugo version can be seen in the theme's [theme.toml](https://github.com/albanpetit/albanpetit.com-theme/blob/master/theme.toml) file

## Commit naming convention
```
<type> <sujet>

<description>
```
- **Type** defines the type of commit
	- **build**: build solution (gulp, webpack, npm)
	- **ci**: Continuous integration (Travis, Circle, BrowserStack, SauceLabs)
	- **git**: gitignore modification. submodule update, merging
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