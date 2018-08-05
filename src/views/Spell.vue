<template>
  <div>

    <table class="style_table">
      <tr>
        <td v-for="(head,k) in header" :key="k">{{head}}</td>
      </tr>
      <template v-for="(row, k) in data">
        <tr :key="k + '-1'">
          <td rowspan="2">
            {{row.Name}}
          </td>
          <td>{{row.Main}}</td><td>{{row.Sub}}</td>
          <td>{{row.Cost}}</td>
          <td>{{row.Terrain}}</td>
          <td>{{row.Type}}</td>
        </tr>
        <tr  :key="k + '-2'">
          <td colspan="5">{{row.ShortDesc}}</td>
        </tr>
      </template>

    </table>
  </div>
</template>

<script>

  export default {
    data:function () {
      return {
        rawData: {},
        header: ["名称", "主属性","複属性", "消費", "使用場面", "簡易分類"],
        configure : {}
      }
    },
    mounted: function(){
      const endPoint = process.env.VUE_APP_JSON_BASE_URL + "Spell.json";
      this.$axios.get(endPoint).then((response) => {
          this.rawData = response.data;
      })
    },
    computed:{
      data:function () {
       return this.rawData
      }
    }

  }
</script>

<style scoped>

</style>