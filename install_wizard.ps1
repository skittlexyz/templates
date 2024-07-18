$repositoryUrl = "https://github.com/skittlexyz/templates"
$destinationFolder = ".wizard_temp"

New-Item -ItemType Directory -Path $destinationFolder -ErrorAction SilentlyContinue | Out-Null

Set-Location $destinationFolder
git init | Out-Null

git config core.sparseCheckout true

@"
wizard/*
"@ | Out-File -FilePath ".git/info/sparse-checkout" -Encoding utf8

git remote add origin $repositoryUrl
git pull --depth=1 origin main | Out-Null

Get-ChildItem -Path "wizard" | Move-Item -Destination . -Force

go build -o ../

Set-Location ..
Remove-Item -Path $destinationFolder -Force -Recurse