<template lang="pug">
  section.home__wrap
    div.home__title
      span.title__tw 搜口罩
      span.title__en Search Mask
    div.home__icon(@clcik="goMask()")
      div.icon__main
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
    }
  },

  created () {
    setTimeout(() => {
      this.$router.push({ name: 'MaskMap' })
    }, 1500)
  },

  methods: {
    goMask () {
      setTimeout(() => {
        this.$router.push({ name: 'MaskMap' })
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './style';
</style>
