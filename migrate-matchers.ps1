# migrate-matchers.ps1
# รันสคริปต์นี้เพื่อแทนที่ Jest matchers ด้วย Chai-style assertions

Get-ChildItem -Recurse -Include *.test.ts,*.test.tsx,*.spec.ts,*.spec.tsx |
  ForEach-Object {
    $file = $_.FullName
    $text = Get-Content -Path $file -Raw

    $text = $text -replace '\.toBe\(',      '.to.equal('
    $text = $text -replace '\.toContain\(', '.to.include('
    $text = $text -replace '\.toHaveLength\(', '.to.have.lengthOf('
    $text = $text -replace '\.toStrictEqual\(', '.to.deep.equal('
    $text = $text -replace '\.toBeNull\(',   '.to.be.null('
    $text = $text -replace '\.toBeTruthy\(', '.to.be.true('
    $text = $text -replace '\.toBeFalsy\(',  '.to.be.false('
    $text = $text -replace '\.to\.be\.null\(',   '.to.be.null'

    Set-Content -Path $file -Value $text
  }
