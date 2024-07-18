$repositoryUrl = "https://github.com/skittlexyz/templates"
$destinationFolder = "my_wizard_folder"

New-Item -ItemType Directory -Path $destinationFolder -ErrorAction SilentlyContinue | Out-Null

Set-Location $destinationFolder
git init | Out-Null

git config core.sparseCheckout true

@"
wizard/*
"@ | Out-File -FilePath ".git/info/sparse-checkout" -Encoding utf8

git remote add origin $repositoryUrl
git pull --depth=1 origin main | Out-Null

Set-Location ..