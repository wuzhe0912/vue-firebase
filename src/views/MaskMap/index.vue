<template lang="pug">
  div.map__wrap
    main.content
      aside.left__side
        div.side__title
          div.title__avatar
          div.txt__wrap
            p.txt__tip 貼心小提醒
            template(v-if="week === 0")
              p 今天是<span class="txt__number">{{ weekFormatter(week) }}</span>
              span 全部民眾皆能購買口罩！
            template(v-else)
              p 今天是<span class="txt__number">{{ weekFormatter(week) }}</span>身分證末一碼為
              span.txt__number(v-if="isEven") 「2、4、6、8、0」
              span.txt__number(v-else) 「1、3、5、7、9」
              span 的民眾才能購買口罩唷！
        div.side__list
          label.list__city__name 縣市
          select.list__select(v-model="select.city")
            option(value="") 請選擇任一縣市
            option(v-model="node.CityName" v-for="node in cityName" :key="node.CityName") {{ node.CityName }}
          label.list__city__name 地區
          select.list__select(v-model="select.city")
            option(value="") 請選擇任一地區
            option(v-model="node.CityName" v-for="node in cityName" :key="node.CityName") {{ node.CityName }}
      div.right__side
        div.right__side__title
          div.title__img
          div.title__txt(v-for="node in txtList" :class="[`txt__${node.code}`]") {{ node.name }}
        l-map(:zoom="zoom" :center="center").right__map
          l-tile-layer(:url="url" :attribution="attribution")
          v-marker-cluster(:options="clusterOptions")
            template(v-for="node in formData")
              //- Vueleaflet 在跑 v-for 迴圈時，必須將判斷條件綁在 l-marker
              l-marker(
                v-if="node.properties.mask_adult > 100"
                :lat-lng="[node.geometry.coordinates[1], node.geometry.coordinates[0]]"
                :icon="moreIcon"
              )
              l-marker(
                v-else-if="node.properties.mask_adult > 50 && node.properties.mask_adult < 100"
                :lat-lng="[node.geometry.coordinates[1], node.geometry.coordinates[0]]"
                :icon="normalIcon"
              )
              l-marker(
                v-else-if="node.properties.mask_adult > 0 && node.properties.mask_adult < 50"
                :lat-lng="[node.geometry.coordinates[1], node.geometry.coordinates[0]]"
                :icon="lessIcon"
              )
              l-marker(
                v-else
                :lat-lng="[node.geometry.coordinates[1], node.geometry.coordinates[0]]"
                :icon="outIcon"
              )
    footer.footer 口罩庫存最後更新時間：{{ updateTime }}
</template>

<script>
import { DAY_LIST } from '@/configs/site.js'
import cityName from '@/assets/cityName'
import { latLng, icon } from 'leaflet'
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster'
// let osmMap = {}

export default {
  name: 'MaskMap',

  components: {
    'v-marker-cluster': Vue2LeafletMarkerCluster
  },

  data () {
    return {
      week: '',
      isEven: false,
      cityName,
      select: {
        city: '臺北市'
      },
      formData: [],
      txtList: [
        { name: '充足', code: 'more' },
        { name: '普通', code: 'normal' },
        { name: '少量', code: 'less' }
      ],
      updateTime: '',
      // 初始化地圖資料
      zoom: 14, // 縮放比例
      center: latLng(25.03, 121.55),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // 地圖資料來源
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      clusterOptions: {
        disableClusteringAtZoom: 16
      },
      dynamicSize: [52, 72],
      dynamicAnchor: [26, 72],
      moreIcon: icon({
        iconUrl: require('./images/icon-more.svg'),
        iconSize: this.dynamicSize,
        iconAnchor: this.dynamicAnchor
      }),
      normalIcon: icon({
        iconUrl: require('./images/icon-normal.svg'),
        iconSize: this.dynamicSize,
        iconAnchor: this.dynamicAnchor
      }),
      lessIcon: icon({
        iconUrl: require('./images/icon-less.svg'),
        iconSize: this.dynamicSize,
        iconAnchor: this.dynamicAnchor
      }),
      outIcon: icon({
        iconUrl: require('./images/icon-out.svg'),
        iconSize: this.dynamicSize,
        iconAnchor: this.dynamicAnchor
      }),
      allPharmacieList: [],
      cityPharmacieList: []
    }
  },

  computed: {
  },

  mounted () {
    // 取得遠端資料
    const url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    this.$http.get(url).then((res) => {
      console.log(res)
      this.updateTime = res.data.features[0].properties.updated
      this.formData = res.data.features
    }).catch((err) => {
      console.log(err)
    })
  },

  created () {
    this.checkWeek()
  },

  methods: {
    checkWeek () {
      let item = new Date()
      this.week = item.getDay()
      if (this.week % 2 === 0) {
        this.isEven = true
      } else this.isEven = false
    },
    weekFormatter (val) {
      let target = DAY_LIST.find(node => node.code === val)
      if (target) return target.name
      else return target.code
    },
    iconFormatter (val) {
      console.log(val)
    },
    // 當用戶選擇縣市 || 地區時顯示對應區域資料
    updateMap () {
      // 撈出選中的城市藥局列表
      this.cityPharmacieList = this.formData.filter((node) => {
        return node.properties.county === this.select.city
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './style';
  @import "~leaflet.markercluster/dist/MarkerCluster.css";
  @import "~leaflet.markercluster/dist/MarkerCluster.Default.css";
</style>
