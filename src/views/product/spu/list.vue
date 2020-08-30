<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <CategorySelector @changeCategory="changeCategory" :listDivVisible="listDivVisible"></CategorySelector>
    </el-card>
    <el-card>
      <!-- <div v-show="!SpuFormVisible && !SkuFormVisible"> 感觉没那么好理解 -->
      <div v-show="isShow === 0">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddSpuForm"
          :disabled="spuList.length === 0"
        >新增SPU</el-button>
        <el-table :data="spuList" style="width: 100%; margin: 20px 0">
          <!-- 不指定width则均分 -->
          <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称"></el-table-column>
          <el-table-column prop="description" label="SPU描述"></el-table-column>
          <el-table-column prop="prop" label="操作">
            <template slot-scope="{row}">
              <HintButton type="primary" icon="el-icon-plus" size="mini" circle title="添加SKU"></HintButton>
              <HintButton type="warning" icon="el-icon-edit" size="mini" circle title="修改SPU"></HintButton>
              <HintButton type="info" icon="el-icon-info" size="mini" circle title="查看SPU下所有SKU"></HintButton>
              <HintButton type="danger" icon="el-icon-delete" size="mini" circle title="删除SPU"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          style="text-align: center"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper, ->, sizes, total"
          :total="total"
        ></el-pagination>
      </div>

      <!-- 将spu和sku表单拆成单独的组件 -->
      <!--  -->
      <SpuForm v-show="isShow === 1" :visible.sync='isShow'></SpuForm>
      <SkuForm v-show="isShow === 2"></SkuForm>
    </el-card>
  </div>
</template>
 
<script>
import SpuForm from "@/views/product/components/SpuForm";
import SkuForm from "@/views/product/components/SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      spuList: [],
      category1Id: "",
      category2Id: "",
      category3Id: "",
      page: 1,
      limit: 3,
      total: 0,
      // 只是为了传递给三级分类控制其可操作性
      listDivVisible: true,
      // SpuFormVisible: false,
      // SkuFormVisible: false,
      isShow: 0, // 切换组件，0为列表，1为spu表单，2为sku表单
    };
  },
  methods: {
    // 自定义事件，判断子组件传过来的level保存成category1Id/category2Id/category3Id，发请求的函数要用
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        // 保存一级id的同时清除之前的二三级id和列表
        this.category2Id = "";
        this.category3Id = "";
        this.attrInfoList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        // 保存二级id的同时清除之前的三级id和列表
        this.category3Id = "";
        this.attrInfoList = [];
      } else {
        this.category3Id = categoryId;
        // 三级id都有了，发请求
        this.getSpuList();
      }
    },
    async getSpuList(num = 1) {
      this.page = num;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(limit) {
      this.limit = limit;
    },
    // 点击“新增SPU”, 切换到spu表单
    showAddSpuForm() {
      this.isShow = 1;
      this.listDivVisible = false;
    },
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>

