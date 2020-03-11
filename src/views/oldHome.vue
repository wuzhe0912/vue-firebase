<template>
  <div class="row no-gutters">
    <div class="col-sm-3">
    <div class="toolbox">
    <div class="sticky-top bg-white shadow-sm p-2">
    <div class="form-group d-flex">
    <label for="cityName" class="mr-2 col-form-label text-right">縣市</label>
    <div class="flex-fill">
    <select id="cityName" class="form-control" v-model="select.city" @change="removeMarker(); updateMap()">
      <option value="">-- Select One --</option>
      <option :value="node.CityName" v-for="node in cityName" :key="node.CityName">{{ node.CityName }}</option>
    </select>
    </div>
    </div>
    <div class="form-group d-flex">
    <label for="area" class="mr-2 col-form-label text-right">地區</label>
    <div class="flex-fill">
    <select id="area" class="form-control">
      <option value="">-- Select One --</option>
    </select>
    </div>
    </div>
    <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有口罩）</p>
    </div>
    <ul class="list-group">
    <template>
    <a class="list-group-item text-left">
    <h3>藥局名稱</h3>
    <p class="mb-0">
    成人口罩：1 | 兒童口罩：2
    </p>
    <p class="mb-0">地址：<a href="https://www.google.com.tw/maps/place/..."
    target="_blank" title="Google Map">
    地址</a>
    </p>
    </a>
    </template>
    </ul>
    </div>
    </div>
    <div class="col-sm-9">
    <div id="map"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import L from 'leaflet'
import cityName from '@/assets/cityName'

let osmMap = {}

export default {
  name: 'Home',
  // data 初始建立可採用箭頭函數寫法
  // data: () => ({
  //   formData: []
  // }),
  data () {
    return {
      formData: [],
      cityName,
      select: {
        city: '臺北市'
      },
      pharmacieList: []
    }
  },
  /*
    created => 在生命週期中，尚處於取得資料階段
    mounted(鉤子函數) => 除了取得資料，等待將畫面結構渲染完成
  */
  mounted () {
    // 取得遠端資料
    const url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    this.$http.get(url).then((res) => {
      this.formData = res.data.features
      this.updateMap()
    }).catch((err) => {
      console.log(err)
    })
    // 'map' => 對應 html 上的 #map
    osmMap = L.map('map', {
      center: [25.03, 121.55],
      zoom: 15
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(osmMap)
    // 建立地圖插入的座標標記
    L.marker([25.03, 121.55]).addTo(osmMap)
  },
  methods: {
    updateMap () {
      const pharmacies = this.formData.filter((node) => {
        return node.properties.county === this.select.city
      })
      // pharmacies.forEach((subNode) => {
      //   L.marker([
      //     subNode.geometry.coordinates[1],
      //     subNode.geometry.coordinates[0]
      //   ]).addTo(osmMap)
      // })
      // 承上，解構賦值寫法如下
      pharmacies.forEach((subNode) => {
        const { properties, geometry } = subNode
        L.marker([
          geometry.coordinates[1],
          geometry.coordinates[0]
        ]).addTo(osmMap).bindPopup(
          `
            <strong>${properties.name}</strong><br>
            成人口罩剩餘數量：<strong>${properties.mask_adult}</strong><br>
            兒童口罩剩餘數量：<strong>${properties.mask_child}</strong><br>
            地址：<a href="https://www.google.com.tw/maps/place/${properties.address}" target="_blank">${properties.address}</a><br>
            電話：${properties.phone}<br>
            <small>最後更新時間</small>：<strong>${properties.updated}</strong>
          `)
      })
    },
    // 當切換縣市或地區時，清除原先選中的地區縣市圖層，再進行重繪
    removeMarker () {
      osmMap.eachLayer((node) => {
        if (node instanceof L.Marker) {
          osmMap.removeLayer(node)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'bootstrap/scss/bootstrap';

  #map {
    height: 100vh;
  }
  .highlight {
    background: #e9ffe3;
  }
  .toolbox {
    height: 100vh;
    overflow-y: auto;
    a {
    cursor: pointer;
    }
  }
</style>
