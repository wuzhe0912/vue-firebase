<template lang="pug">
  .map__wrap
    main.content
      aside.left__side
        .side__title
          .title__avatar
          .txt__wrap
            p.txt__tip 貼心小提醒
            template(v-if="week === 0")
              p 今天是<span class="txt__number">{{ weekFormatter(week) }}</span>
              span 全部民眾皆能購買口罩！
            template(v-else)
              p 今天是<span class="txt__number">{{ weekFormatter(week) }}</span>身分證末一碼為
              span.txt__number(v-if="isEven") 「2、4、6、8、0」
              span.txt__number(v-else) 「1、3、5、7、9」
              span 的民眾才能購買口罩唷！
        .side__list
          .dropdown__select
            multiselect(
              v-model="citySelected"
              label="CityName",
              track-by="CityName",
              placeholder="請選擇任一縣市",
              :options="cityName",
              :searchable="false",
              :show-labels="false",
              :allow-empty="false",
              @input="updateMap()"
            )
          .dropdown__select
            multiselect(
              v-model="townSelected"
              label="AreaName",
              track-by="AreaName",
              placeholder="請選擇任一鄉鎮地區",
              :options="townName",
              :searchable="false",
              :show-labels="false",
              :allow-empty="false",
              @input="townUpdateMap()"
            )
        .side__card
          .card__wrap(v-for="node in formData")
            i.card__icon
            .card__txt
              .card__title {{ node.properties.name }}
              .card__phone {{ node.properties.phone }}
              .card__address {{ node.properties.address }}
            .card__footer
              span.mask__number.card__adult(
                :class="{more: node.properties.mask_adult > 100, normal: node.properties.mask_adult > 50 && node.properties.mask_adult < 100, less: node.properties.mask_adult > 0 && node.properties.mask_adult < 50, out: node.properties.mask_adult === 0}"
              ) 成人：{{ node.properties.mask_adult }}
              span.mask__number.card__child(
                :class="{more: node.properties.mask_child > 100, normal: node.properties.mask_child > 50 && node.properties.mask_child < 100, less: node.properties.mask_child > 0 && node.properties.mask_child < 50, out: node.properties.mask_child === 0}"
              ) 兒童：{{ node.properties.mask_child }}
      .right__side
        .right__side__title
          .title__img
          .title__txt(v-for="node in txtList" :class="[`txt__${node.code}`]") {{ node.name }}
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
      townName: [],
      citySelected: '',
      townSelected: '',
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
      formData: [],
      allPharmacieList: [],
      cityPharmacieList: []
    }
  },

  mounted () {
    // 取得遠端藥局 API 資料
    const url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    this.$http.get(url).then((res) => {
      this.updateTime = res.data.features[0].properties.updated
      this.allPharmacieList = res.data.features
      console.log(this.allPharmacieList)
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
    // 當用戶選擇縣市地區時顯示對應資料
    updateMap () {
      this.townSelected = ''
      // 撈出選中的城市藥局列表
      this.formData = this.allPharmacieList.filter((node) => {
        return node.properties.county === this.citySelected.CityName
      })
      // 過濾出選中城市底下的鄉鎮列表
      let subItem = this.cityName.filter((subNode) => {
        return subNode.CityName === this.citySelected.CityName
      })
      this.townName = subItem[0].AreaList
    },
    townUpdateMap () {
      // 撈出選中的地區藥局列表
      this.formData = this.allPharmacieList.filter((node) => {
        return node.properties.town === this.townSelected.AreaName
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
