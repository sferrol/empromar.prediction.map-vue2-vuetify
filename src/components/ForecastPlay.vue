<template>
  <div class="play-bar">
    <div class="play-bar-toggle">
      <div class="play-bar-icon"></div>
    </div>
    <div class="play-bar-current-time"><div class="time">5:40&nbsp;PM</div><div class="day-name"></div></div>
    <div class="play-bar-scrubber">
      <div class="play-bar-now-text" style="left: 100.057px;">Ahora</div>
      <div class="play-bar-progress" style="width: 101.057px;"></div>
      <svg class="play-bar-track" xmlns="http://www.w3.org/2000/svg"><line id="progress-line" x1="0.5" x2="0.5" y1="0" y2="100%"></line><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(6.385714285714286px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(12.271428571428572px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(18.15714285714286px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(24.042857142857144px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(29.92857142857143px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(35.81428571428572px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(41.7px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(47.58571428571429px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(53.471428571428575px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(59.35714285714286px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(65.24285714285715px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(71.12857142857143px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(77.01428571428572px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(82.9px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(88.78571428571429px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(94.67142857142858px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(100.55714285714286px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(106.44285714285715px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(112.32857142857144px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(118.21428571428572px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(124.10000000000001px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(129.9857142857143px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(135.87142857142857px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(141.75714285714287px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(147.64285714285717px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(153.52857142857144px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(159.4142857142857px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(165.3px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(171.1857142857143px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(177.07142857142858px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(182.95714285714286px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(188.84285714285716px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(194.72857142857146px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(200.61428571428573px)"></use><use href="#progress-line" stroke="#9fa3a8" style="transform:translateX(206.5px)"></use></svg>
    </div>
    <div class="play-bar-end-time"><div class="time">7:15&nbsp;PM CET</div><div class="day-name"></div></div>
  </div>
</template>

<script>
  export default {

  }
</script>

<style scoped>
.play-bar {
    align-items: center;
    background-color: #e5eaf1;
    border-radius: 23px;
    bottom: 36px;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,.4);
    color: #000;
    display: flex;
    font-size: 12px;
    height: 44px;
    left: 12px;
    position: absolute;
    width: calc(100% - 24px);
    z-index: 1
}

@media(min-width: 480px) {
    .play-bar {
        bottom:42px;
        width: 355px
    }
}

.play-bar .play-bar-toggle {
    align-items: center;
    background-color: #fff;
    border-radius: 23px;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 44px;
    justify-content: center;
    margin-right: 8px;
    width: 44px
}

@media(min-width: 480px) {
    .play-bar .play-bar-toggle {
        margin-right:16px
    }
}

.play-bar .play-bar-icon {
    border-bottom: 5px solid transparent;
    border-left: 7px solid #000;
    border-top: 5px solid transparent;
    height: 10px;
    width: 8px
}

.play-bar.is-playing .play-bar-icon {
    border: 0;
    display: flex;
    justify-content: space-between
}

.play-bar.is-playing .play-bar-icon:after,.play-bar.is-playing .play-bar-icon:before {
    background: #000;
    content: "";
    width: 3px
}

.play-bar.is-started .play-bar-progress {
    background-color: #000
}

.play-bar .play-bar-current-time,.play-bar .play-bar-end-time {
    flex-shrink: 0;
    font-size: 12px;
    margin-right: 8px;
    white-space: nowrap;
    width: 44px
}

@media(min-width: 480px) {
    .play-bar .play-bar-current-time,.play-bar .play-bar-end-time {
        margin-right:14px
    }
}

.play-bar .play-bar-end-time {
    text-align: right;
    width: 66px
}

.play-bar .day-name {
    font-size: 10px
}

.play-bar .play-bar-scrubber {
    cursor: default;
    display: flex;
    flex-grow: 1;
    margin-right: 4px;
    padding: 16px 0;
    position: relative
}

@media(min-width: 480px) {
    .play-bar .play-bar-scrubber {
        margin-right:12px
    }
}

.play-bar .play-bar-progress {
    align-items: center;
    background: #9fa3a8;
    display: flex;
    height: 8px;
    justify-content: flex-end;
    left: 0;
    position: absolute;
    top: 16px
}

.play-bar .play-bar-progress:after {
    background: inherit;
    content: "";
    height: 16px;
    width: 1px
}

.play-bar .play-bar-now-text {
    bottom: 0;
    color: #666c72;
    font-size: 10px;
    position: absolute;
    transform: translateX(-50%);
    white-space: nowrap
}

.play-bar .play-bar-track {
    height: 8px;
    overflow: visible;
    width: 100%
}

.play-bar .play-bar-track line {
    stroke-width: 1px;
    stroke: #9fa3a8;
    shape-rendering: geometricPrecision
}

.play-bar .play-bar-track line.now-marker {
    stroke: #9fa3a8
}

.map-container-legacy.full-screen .play-bar {
    bottom: 42px;
    left: 50%;
    transform: translateX(-50%);
}
</style>
