# albanpetit.com
[![github-pages](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/gh-pages.yml)
[![pages-build-deployment](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/AlbanPetit/albanpetit.com/actions/workflows/pages/pages-build-deployment)

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