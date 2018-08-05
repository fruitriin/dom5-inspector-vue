<template>
  <div>
    <table>
      <tr>
        <td v-for="head in header">{{head}}</td>
      </tr>
      <tr v-for="row in data">
        <td v-for=""></td>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    data:function () {
      return {
        rowData: {},
        header: {},
        configure : {}
      }
    },
    mounted: function(){
      process.env.JSON_BASE_URL

    },
    computed:{
      data:function () {
        this.rowData
       return {}
      }
    }

  }
</script>

<style scoped>

</style>