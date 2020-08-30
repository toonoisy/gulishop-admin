<template>
  <div>
    <!-- 只有显示列表div的时候，三级分类才可操作 -->
    <el-form :inline="true" :model="form" class="demo-form-inline" :disabled="!listDivVisible">
      <el-form-item label="一级分类">
        <el-select v-model="form.category1Id" placeholder="请选择" @change='handleCategory1'>
          <el-option :label="c1.name" :value="c1.id" v-for="c1 in category1List" :key="c1.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select v-model="form.category2Id" placeholder="请选择" @change="handleCategory2">
          <el-option :label="c2.name" :value="c2.id" v-for="c2 in category2List" :key="c2.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="form.category3Id" placeholder="请选择" @change="handleCategory3">
          <el-option :label="c3.name" :value="c3.id" v-for="c3 in category3List" :key="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelector",
  props:['listDivVisible'], // attr & spu组件都使用三级分类，都分别传了
  data() {
    return {
      // 收集各级选中的分类id
      form: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      category1List: [], // 一级分类列表
      category2List: [], // 二级分类列表
      category3List: [], // 三级分类列表
    };
  },
  mounted() {
    this.getCategory1List();
  },
  methods: {
    // 一上来就请求获取一级数据
    async getCategory1List() {
      const result = await this.$API.category.getCategorys1();
      if (result.code === 200) {
        this.category1List = result.data;
      }
    },
    // 只有选中一级id才请求获取二级数据，同时要清除之前选中的二三级id和分类列表数据，并且通知父组件清除之前请求到的属性数据，以确保数据展示是最新的
    async handleCategory1(category1Id) {
      this.form.category2Id = '';
      this.form.category3Id = '';
      this.category2List = [];
      this.category3List = [];
      this.$emit('changeCategory', {categoryId: category1Id, level: 1});
      const result = await this.$API.category.getCategorys2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
        // 传id给父组件保存，传level是为了方便保存的时候判断
      }
    },
    // 只有选中二级id才请求获取三级数据，同时要清除之前选中的三级id和分类列表数据，并且通知父组件清除之前请求到的属性数据，以确保数据展示是最新的
    async handleCategory2(category2Id) {
      this.form.category3Id = '';
      this.category3List = [];
      this.$emit('changeCategory', {categoryId: category2Id, level: 2});
      const result = await this.$API.category.getCategorys3(category2Id);
      if (result.code === 200) {
        this.category3List = result.data;
        // 传id给父组件保存，传level是为了方便保存的时候判断
      }
    },
    // 一旦选中三级id，通知父组件发请求拿属性信息列表
    handleCategory3(category3Id) {
      // 传id给父组件保存，传level是为了方便保存的时候判断
      this.$emit('changeCategory', {categoryId: category3Id, level: 3});
    }

  },
};
</script>

<style>
</style>
