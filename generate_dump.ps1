$files = Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx,*.js,*.sol,*.html -File | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\dist\\' -and 
    $_.FullName -notmatch '\\build\\' -and 
    $_.FullName -notmatch '\\.git\\' -and 
    $_.FullName -notmatch '\\coverage\\' 
}

$outfile = "project_code_dump.txt"
Set-Content -Path $outfile -Value "Project Source Code Dump"

foreach ($f in $files) {
    Add-Content -Path $outfile -Value "`n`n================================================================================"
    Add-Content -Path $outfile -Value "FILE: $($f.FullName)"
    Add-Content -Path $outfile -Value "================================================================================`n"
    Get-Content $f.FullName | Add-Content -Path $outfile
}

Write-Host "Code dump generated at $outfile"
