param(
    [Parameter(Mandatory = $true)][string]$XlsxPath,
    [Parameter(Mandatory = $true)][string]$XlsmPath
)

$XlsxPath = (Resolve-Path $XlsxPath).Path
$XlsmPath = [System.IO.Path]::GetFullPath($XlsmPath)

if (-not (Test-Path $XlsxPath)) {
    throw "Missing source workbook: $XlsxPath"
}

if (Test-Path $XlsmPath) {
    Remove-Item -Force $XlsmPath
}

$excel = $null
$wb = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $wb = $excel.Workbooks.Open($XlsxPath)
    # xlOpenXMLWorkbookMacroEnabled
    $wb.SaveAs($XlsmPath, 52)
    $wb.Close($false)
    $excel.Quit()
    Write-Output "Saved $XlsmPath"
}
finally {
    if ($wb) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) }
    if ($excel) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
