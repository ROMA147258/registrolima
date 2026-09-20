Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "E:\conteolima\registroconteolima\frontend\public\images\BANCO OFICIAL DE PREGUNTAS Y RESPUESTAS (1).docx"
$outXmlPath = "E:\conteolima\registroconteolima\extracted_doc.xml"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
[System.IO.File]::WriteAllText($outXmlPath, $xmlText, [System.Text.Encoding]::UTF8)
Write-Output "Extracted document.xml successfully"
