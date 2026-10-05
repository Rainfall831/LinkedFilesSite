fetch("https://api.github.com/repos/Rainfall831/LinkedFiles-releases/releases/latest")
  .then((r) => r.json())
  .then((rel) => {
    const asset = rel.assets.find((x) => x.name.endsWith("_x64-setup.exe"));
    if (!asset) return;
    const dl = document.getElementById("dl");
    if (dl) dl.href = asset.browser_download_url;
    document.querySelectorAll(".js-download").forEach((el) => {
      el.href = asset.browser_download_url;
    });
  });
