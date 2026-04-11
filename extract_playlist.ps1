$playlists = @{
  mat = 'PLVcVykBcFZTSTXBhoJ7Vy8k3wme-WazWx'
  mar = 'PLVcVykBcFZTQ-DDhzFEe9VFNbIga8bsRu'
  luk = 'PLVcVykBcFZTRw2xviipQP_nSMwuIjrSdU'
  joh = 'PLVcVykBcFZTSVPCalzgtqeGgiDBI_l3uY'
  act = 'PLVcVykBcFZTRwKAucEvWGscP9_xo0z9Rm'
  rom = 'PLVcVykBcFZTQErCfBGIQxP8msUpTfnmPk'
  '1co' = 'PLVcVykBcFZTR6hWiFEQcksQW0mZu1fHQS'
  '2co' = 'PLVcVykBcFZTShgrluRh6vwcRUGRQ0QTY0'
  gal = 'PLVcVykBcFZTRLZaBZaPgI1JqlexuhFtlD'
  eph = 'PLVcVykBcFZTR3dtKvRgBQk3r0lTzUlITL'
  php = 'PLVcVykBcFZTQKPcF6BVLrmrBkWkNVq_lt'
  col = 'PLVcVykBcFZTRWCNKuQoMi9wP08LVPUy94'
  '1th' = 'PLVcVykBcFZTS2Z_h8SSsMRYI5yesRZXVx'
  '2th' = 'PLVcVykBcFZTTtDC6gxCWQounEL3OuBuNf'
  '1ti' = 'PLVcVykBcFZTQz2XMSjpXSTaJnU0iog_ip'
  '2ti' = 'PLVcVykBcFZTTvGsQb4HFyyuQJbGc0ethz'
  tit = 'PLVcVykBcFZTS4AiVsTwtm2mPqp4dne4WC'
  phm = 'PLVcVykBcFZTQzPG1SJjRhge1y1wtp1cso'
  heb = 'PLVcVykBcFZTRjPKsRKmc9oh6tAM4GqMVN'
  jam = 'PLVcVykBcFZTSc6pVweQMnjjNLA2ABTrzv'
  '1pe' = 'PLVcVykBcFZTRC-7RuMXfGHS3fz0_UwHvx'
  '2pe' = 'PLVcVykBcFZTSW5MJ9RaXIq82RShopBEZd'
  '1jo' = 'PLVcVykBcFZTRYzvGCsEIeFbM5zLikXKlU'
  '2jo' = 'PLVcVykBcFZTSadmVOtxjoRN1CvPW7ueCo'
  '3jo' = 'PLVcVykBcFZTQ7k5thEDMAohYmV1nkwdDF'
  jud = 'PLVcVykBcFZTTgDnBM9vAFn62ShCwrgULi'
  rev = 'PLVcVykBcFZTQBSmAaWch8DXgd1T3Svx2z'
}

$output = "export const VIDEO_MAP_FULL = {`n"

foreach ($book in $playlists.Keys | Sort-Object) {
  $pid = $playlists[$book]
  Write-Host "Processing $book ($pid)..."
  $items = yt-dlp "https://www.youtube.com/playlist?list=$pid" --flat-playlist --dump-json 2>$null | ForEach-Object {
    $j = $_ | ConvertFrom-Json
    $ch = [regex]::Match($j.title, '(\d+)장').Groups[1].Value
    if ($ch) { [PSCustomObject]@{ chapter = [int]$ch; id = $j.id } }
  } | Sort-Object chapter
  
  $output += "  '$book': {`n"
  foreach ($item in $items) {
    $output += "    $($item.chapter): '$($item.id)',`n"
  }
  $output += "  },`n"
}

$output += "};`n"
$output | Out-File -FilePath "video_map.js" -Encoding utf8
Write-Host "Done! video_map.js written."
