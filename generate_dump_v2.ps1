$outfile = "full_project_code.txt"
$sb = New-Object -TypeName "System.Text.StringBuilder"
[void]$sb.AppendLine("Project Source Code Dump")

$files = Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx,*.js,*.sol,*.html -File | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\dist\\' -and 
    $_.FullName -notmatch '\\build\\' -and 
    $_.FullName -notmatch '\\.git\\' -and 
    $_.FullName -notmatch '\\coverage\\' 
}

foreach ($f in $files) {
    [void]$sb.AppendLine("`n`n================================================================================")
    [void]$sb.AppendLine("FILE: $($f.FullName)")
    [void]$sb.AppendLine("================================================================================`n")
    try {
        $content = [System.IO.File]::ReadAllText($f.FullName)
        [void]$sb.AppendLine($content)
    } catch {
        [void]$sb.AppendLine("[Error reading file]")
    }
}

[System.IO.File]::WriteAllText($outfile, $sb.ToString())
Write-Host "Code dump generated at $outfile"
