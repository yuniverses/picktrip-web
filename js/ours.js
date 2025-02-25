document.addEventListener("DOMContentLoaded", function () {
  // 取得 preloader 與 lottie 容器
  const preloader = document.getElementById("preloader");
  const lottieContainer = document.getElementById("lottie");

  // 利用 Lottie 載入動畫
  const lottieAnimation = lottie.loadAnimation({
    container: lottieContainer,
    renderer: "svg",
    loop: false, // 不循環播放
    autoplay: false, // 不自動播放，由進度控制
    path: "images/loading.json", // 請換成你的 Lottie JSON 檔案路徑
  });

  // 等 Lottie 動畫資源載入完畢（DOMLoaded 事件），確保 totalFrames 可用
  lottieAnimation.addEventListener("DOMLoaded", function () {
    updateProgress();
  });

  // 取得頁面所有圖片
  const images = document.images;
  const totalImages = images.length;
  let loadedCount = 0;

  // 每張圖片載入完畢或發生錯誤都呼叫此函式
  function imageLoaded() {
    loadedCount++;
    updateProgress();
  }

  // 根據目前載入進度更新 Lottie 動畫的幀數與百分比顯示
  function updateProgress() {
    // 避免除以 0
    const progress = totalImages === 0 ? 1 : loadedCount / totalImages;
    // 更新百分比顯示
    const percentageEl = document.getElementById("loading-percentage");
    percentageEl.textContent = Math.floor(progress * 100) + "%";

    // 若 Lottie 已準備好，依據進度顯示對應幀
    if (lottieAnimation.totalFrames) {
      const frame = Math.round(progress * lottieAnimation.totalFrames);
      lottieAnimation.goToAndStop(frame, true);
    }

    // 當進度達到或超過 100% 時，開始淡出 preloader
    if (progress >= 1) {
      setTimeout(() => {
        preloader.classList.add("fade-out");
        setTimeout(() => {
          preloader.style.display = "none";
        }, 1000);
      }, 500);
    }
  }

  // 為所有圖片加上載入事件，若圖片已經載入則直接計數
  if (totalImages === 0) {
    updateProgress();
  } else {
    for (let i = 0; i < totalImages; i++) {
      if (images[i].complete) {
        imageLoaded();
      } else {
        images[i].addEventListener("load", imageLoaded);
        images[i].addEventListener("error", imageLoaded);
      }
    }
  }

  // 加入 fallback 機制：10秒後若進度未達100%，則直接完成進度
  setTimeout(() => {
    if (loadedCount / totalImages < 1) {
      loadedCount = totalImages;
      updateProgress();
    }
  }, 5000);
});

window.addEventListener("load", () => {
  // 1. 判斷是否為行動裝置
  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /******************************
   * Lottie + ScrollTrigger
   ******************************/
  // 根據螢幕寬度決定使用的 JSON 檔案路徑
  const lottiePath =
    window.innerWidth < 1000
      ? "images/picktrip_intro_mobile.json" // 小於 1000px 時使用此 JSON
      : "images/picktrip_intro.json"; // 其他情況使用此 JSON

  // 1. 先載入 Lottie 動畫
  let lottieAnimation = lottie.loadAnimation({
    container: document.getElementById("lottie-container"), // 放動畫的容器
    renderer: "svg",
    loop: false, // 不要自動重複，之後用滾動來控制
    autoplay: false, // 不要自動播放
    path: lottiePath, // 根據螢幕大小選擇對應的 JSON 檔案
  });

  // 2. 等 Lottie 準備好再做 ScrollTrigger
  lottieAnimation.addEventListener("DOMLoaded", () => {
    // 總共幾幀
    const totalFrames = lottieAnimation.totalFrames;

    // 建立一個 dummy object，供 GSAP tween 使用
    let obj = { currentFrame: 0 };

    gsap.to(obj, {
      currentFrame: totalFrames,
      ease: "none", // 線性
      scrollTrigger: {
        trigger: "#lottie-container", // 觸發元素
        pin: true, // 釘住此區塊
        start: "top top",
        end: "+=2000", // 滾動 2000px 距離後結束
        scrub: true, // 跟隨滾動，可來回
        markers: false, // 除錯標記（測試時可開啟）
      },
      onUpdate: () => {
        // 每次更新時，讓 Lottie 到達對應的幀
        lottieAnimation.goToAndStop(obj.currentFrame, true);
      },
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // 取得兩個 row
  var rowRight = document.querySelector(".row-right");
  var rowLeft = document.querySelector(".row-left");

  // 為了達到無限輪播效果，將原有內容複製一次
  rowRight.innerHTML += rowRight.innerHTML;
  rowLeft.innerHTML += rowLeft.innerHTML;

  // 初始平移位置
  var posRight = 0;
  var posLeft = 0;
  // 設定輪播速度（可根據需要調整）
  var speed = 0.5; // 每幀移動 0.5px，大約每秒 30px（60fps）

  // 輪播動畫函數
  function animate() {
    // row-right 往右移動（向正方向平移）
    posRight += speed;
    // row-left 往左移動（向負方向平移）
    posLeft -= speed;

    // 若移動超過原本內容的寬度一半時，重置位置以達到無縫輪播效果
    if (posRight >= rowRight.scrollWidth / 2) {
      posRight = 0;
    }
    if (Math.abs(posLeft) >= rowLeft.scrollWidth / 2) {
      posLeft = 0;
    }

    // 更新 CSS transform
    rowRight.style.transform = "translateX(" + posRight + "px)";
    rowLeft.style.transform = "translateX(" + posLeft + "px)";

    requestAnimationFrame(animate);
  }
  animate();

  // 加入 hover 事件，當使用者滑入某個 goplace 時，顯示裡面的城市名稱與按鈕
  var goplaces = document.querySelectorAll(".goplace");
  goplaces.forEach(function (place) {
    place.addEventListener("mouseenter", function () {
      // 假設城市名稱與按鈕的元素分別有 .city 與 .btn
      var cityEl = place.querySelector(".city");
      var btnEl = place.querySelector(".btn");
      if (cityEl) {
        cityEl.style.opacity = 1;
      }
      if (btnEl) {
        btnEl.style.opacity = 1;
      }
    });
    place.addEventListener("mouseleave", function () {
      var cityEl = place.querySelector(".city");
      var btnEl = place.querySelector(".btn");
      if (cityEl) {
        cityEl.style.opacity = 0;
      }
      if (btnEl) {
        btnEl.style.opacity = 0;
      }
    });
  });
});

window.addEventListener("scroll", function () {
  const viewer = document.querySelector("#mainviewer");
  const hero = document.querySelector(".hero-without-image");
  const fadeStart = 1000; // mainviewer 開始淡出
  const fadeEnd = 1500; // mainviewer 完全淡出並開始被推上去
  const scrollPos = window.scrollY;

  if (scrollPos < fadeStart) {
    // 滾動不足 1000px：mainviewer 固定且全顯示，hero 隱藏
    viewer.style.position = "fixed";
    viewer.style.top = "0";
    viewer.style.transform = "translateY(0)";
    viewer.style.opacity = "1";
    // hero 區塊保持隱藏
    hero.style.opacity = "0";
  } else if (scrollPos >= fadeStart && scrollPos <= fadeEnd) {
    // 1000px ~ 1500px：mainviewer 固定且逐漸淡出
    viewer.style.position = "fixed";
    viewer.style.top = "0";
    // // 透明度線性減少
    let opacity = 1 - (scrollPos - fadeStart) / (fadeEnd - fadeStart);
    viewer.style.opacity = opacity.toString();
    // // 同時可以讓 hero 區塊逐漸顯示
    hero.style.opacity = (
      (scrollPos - fadeStart) /
      (fadeEnd - fadeStart)
    ).toString();
  } else {
    // 超過 1500px：
    // 將 mainviewer 取消 fixed 並用 transform 往上推 100vh
    // viewer.style.position = 'relative';
    viewer.style.top = "0";
    viewer.style.transform = "translateY(-100vh)";
    viewer.style.opacity = "0";
    // // hero 區塊全顯示
    hero.style.opacity = "1";
  }
});
