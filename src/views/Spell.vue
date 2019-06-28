<template>
  <div>
    <div class="filter-field">
      <h4>絞り込み</h4>
      <table>
        <tr>
          <td>名前</td>
          <td><input type="text" v-model="filters.name" /></td>
        </tr>
        <tr>
          <td>属性</td>
          <td>
            <template v-for="element in elements">
              <input
                :id="'filter_' + element"
                type="checkbox"
                v-model="filters.elements"
                :value="element"
              />
              <label :for="'filter_' + element">{{ element }}</label>
            </template>
          </td>
        </tr>
        <tr>
          <td>属性レベル</td>
          <td>
            <input type="number" v-model="filters.elementLevelMin" /> 〜<input
              type="number"
              v-model="filters.elementLevelMax"
            />
          </td>
        </tr>
        <tr>
          <td>領域</td>
          <td>
            <template>
              <template v-for="(school, k) in schools">
                <input
                  :id="'filter_' + school"
                  type="checkbox"
                  v-model="filters.schools"
                  :value="school"
                />
                <label :for="'filter_' + school">{{ school }}</label>
                <br v-if="k === 3" />
              </template>
            </template>
          </td>
        </tr>
        <tr>
          <td>領域レベル</td>
          <td>
            <input type="number" v-model="filters.schoolsLevelMin" /> 〜<input
              type="number"
              v-model="filters.schoolsLevelMax"
            />
          </td>
        </tr>
      </table>
    </div>

    <table class="style_table">
      <tr>
        <td v-for="(head, k) in header" :key="k">{{ head }}</td>
      </tr>
      <template v-for="(row, k) in data">
        <tr :key="k + '-1'">
          <td rowspan="2">
            {{ row.Name }}
            <a :href="`/?Spell/${row.School}/${row.Pname}`">
            <img class="arrowLink" :src="`${baseUrl}/level-up-alt-solid.svg`" width="12" height="12">
          </a>
          </td>
          <td>{{ row.School }} Lv{{ row.Lv }}</td>
          <td v-html="elementToImg(row.Main)"></td>
          <td v-html="elementToImg(row.Sub)"></td>
          <td>{{ row.Cost }}</td>
          <td>{{ row.Terrain }}</td>
          <td>{{ row.Type }}</td>
          <td v-if="row.nations" v-html="row.nations.join('<br>')"></td>
          <td v-else></td>
        </tr>
        <tr :key="k + '-2'">
          <td colspan="7">{{ row.ShortDesc }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script>
var elements = {
  火: "Fire",
  水: "Water",
  風: "Air",
  緑: "Nature",
  地: "Earth",
  星: "Astral",
  死: "Death",
  血: "Blood",
  聖: "Holy"
};
var elementsByEn = _.invert(elements);

var schools = [
  "Conjuration",
  "Alteration",
  "Evocation",
  "Construction",
  "Enchantment",
  "Thaumaturgy",
  "Blood Magic",
  "Divine"
];

export default {
  data: function() {
    return {
      rawData: {},
      nationSpellWork: {},
      header: [
        "名称",
        "領域",
        "主系統",
        "複系統",
        "消費",
        "使用場面",
        "簡易分類",
        "専用国家"
      ],
      elements: Object.values(elements),
      schools: schools,
      filters: {
        name: "",
        schools: [],
        schoolsLevelMin: 0,
        schoolsLevelMax: 9,
        elements: [],
        elementLevelMin: 1,
        elementLevelMax: 9
      },
      configure: {},
      baseUrl : process.env.VUE_APP_JSON_BASE_URL
    };
  },
  async mounted() {
    const endPoint = process.env.VUE_APP_JSON_BASE_URL + "Spell.json";
    const spellResponse = await this.$axios.get(endPoint);
    this.rawData = spellResponse.data;

    // リレーション用のJSONを引っ張ってくる
    const nationSpellWorkResponse = await this.$axios.get(
      `${process.env.VUE_APP_JSON_BASE_URL}/NationalSpellWork.json`
    );
    this.nationSpellWork = nationSpellWorkResponse.data;

    const nationSpellResponse = await this.$axios.get(
      `${process.env.VUE_APP_JSON_BASE_URL}/NationalSpell.json`
    );

    // 関係のある国家情報を配列として入れていく
    Object.keys(nationSpellResponse.data).forEach(spell => {
      nationSpellResponse.data[spell]["nations"] = this.nationSpellRelation[
        nationSpellResponse.data[spell].Pname
      ];
    });

    this.rawData = Object.assign(this.rawData, nationSpellResponse.data);
  },
  computed: {
    nationSpellRelation() {
      const relation = {};
      this.nationSpellWork.forEach(spell => {
        if (relation[spell.Name] === undefined) relation[spell.Name] = [];
        relation[spell.Name].push(`${spell.Era} - ${spell.Nation}`);
      });

      return relation;
    },

    data() {
      if (this.rawData.length === 0) return {};
      return Object.values(this.rawData).filter(d => {
        if (this.filters.name !== "") {
          if (d.Name.indexOf(this.filters.name) === -1) {
            return false;
          }
        }

        let mainElement = d.Main.substr(0, 1);
        let elementLevel = d.Main.substr(1);
        //属性絞り込み
        if (this.filters.elements.length) {
          let filterdElements = _.difference(
            this.elements,
            this.filters.elements
          );
          if (filterdElements.length > 0) {
            let subElement = "";
            if (d.Sub === "") {
              subElement = mainElement;
            } else {
              subElement = d.Sub.substr(0, 1);
            }

            if (
              !(
                filterdElements.indexOf(elements[mainElement]) === -1 ||
                filterdElements.indexOf(elements[subElement]) === -1
              )
            ) {
              return false;
            }
          }
        }

        //属性レベル絞り込み
        if (this.filters.elementLevelMin > elementLevel) {
          return false;
        }
        if (this.filters.elementLevelMax < elementLevel) {
          return false;
        }

        //領域絞り込み
        if (this.filters.schools.length) {
          let filterdSchools = _.difference(this.schools, this.filters.schools);
          if (filterdSchools.indexOf(d.School) !== -1) {
            return false;
          }
        }

        //領域レベル絞り込み
        if (this.filters.schoolsLevelMin > d.Lv) {
          return false;
        }
        if (this.filters.schoolsLevelMax < d.Lv) {
          return false;
        }

        return true;
      });
    },
    filterdListByElement() {
      return this.rawData;
    },
    filterdListBySchool() {
      return this.rawData;
    }
  },
  methods: {
    elementToImg(elementStr) {
      if (elementStr === "" || elementStr === null) return;
      let element = elementStr.substr(0, 1);
      let power = elementStr.substr(1);
      const imgBasePath = `<img src="https://dom5wiki.gamelore.fun/?plugin=ref&amp;page=Spell&amp;src=P_Element.jpg" alt="Element" title="" width="25" height="25" data-original-title="Element">`;

      return imgBasePath.split("Element").join(elements[element]) + power;
    }
  }
};
</script>

<style scoped lang="scss">
</style>
