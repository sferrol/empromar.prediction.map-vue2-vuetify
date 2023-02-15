<template>
  <div class="radar-legend ">
    <div class="legend-item rain">
      <div class="label">Lluvia</div>
      <div class="block c-1"></div>
      <div class="block c-2"></div>
      <div class="block c-3"></div>
      <div class="block c-4"></div>
    </div>
    <div class="legend-item snow">
      <div class="label">Nieve</div>
      <div class="block c-1"></div>
      <div class="block c-2"></div>
      <div class="block c-3"></div>
      <div class="block c-4"></div>
    </div>
    <div class="legend-item ice">
      <div class="label">Hielo</div>
      <div class="block c-1"></div>
      <div class="block c-2"></div>
      <div class="block c-3"></div>
      <div class="block c-4"></div>
    </div>
    <div class="legend-item mix">
      <div class="label">Mezcla</div>
      <div class="block c-1"></div>
      <div class="block c-2"></div>
      <div class="block c-3"></div>
      <div class="block c-4"></div>
    </div>
  </div>
</template>

<script>
  export default {

  }
</script>

<style scoped>
  .radar-legend {
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-box-pack: space-evenly;
    -ms-flex-pack: space-evenly;
    align-items: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }
  .radar-legend .legend-item {
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      align-items: center;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      justify-content: center;
  }

  .radar-legend .legend-item .label {
      color: #000;
      font-size: 12px;
      margin-right: 4px
  }
  .radar-legend .legend-item .block {
      border-radius: 8px;
      height: 8px;
      width: 8px
  }
  .radar-legend .legend-item .block:not(:last-child) {
      margin-right: 3px
  }
  .radar-legend .legend-item.rain .c-1 {
      background-color: #93c701
  }
  .radar-legend .legend-item.rain .c-2 {
      background-color: #ffd701
  }
  .radar-legend .legend-item.rain .c-3 {
      background-color: #f05514
  }
  .radar-legend .legend-item.rain .c-4 {
      background-color: #dc250e
  }
  .radar-legend .legend-item.snow .c-1 {
      background-color: #9ec8f2
  }
  .radar-legend .legend-item.snow .c-2 {
      background-color: #2a8fdb
  }
  .radar-legend .legend-item.snow .c-3 {
      background-color: #144bed
  }
  .radar-legend .legend-item.snow .c-4 {
      background-color: #020096
  }
  .radar-legend .legend-item.ice .c-1 {
      background-color: #e6a5c8
  }
  .radar-legend .legend-item.ice .c-2 {
      background-color: #d24fa0
  }
  .radar-legend .legend-item.ice .c-3 {
      background-color: #b71691
  }
  .radar-legend .legend-item.ice .c-4 {
      background-color: #7a1570
  }
  .radar-legend .legend-item.mix .c-1 {
      background-color: #c196e6
  }
  .radar-legend .legend-item.mix .c-2 {
      background-color: #ae6ee6
  }
  .radar-legend .legend-item.mix .c-3 {
      background-color: #8a32d7
  }
  .radar-legend .legend-item.mix .c-4 {
      background-color: #6500ba
  }
</style>
