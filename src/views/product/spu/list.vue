<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <CategorySelector @changeCategory="changeCategory" :listDivVisible="listDivVisible"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="!spuFormVisible && !skuFormVisible">
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
              <HintButton
                type="primary"
                icon="el-icon-plus"
                size="mini"
                circle
                title="添加SKU"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                circle
                title="修改SPU"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton
                type="info"
                icon="el-icon-info"
                size="mini"
                circle
                title="查看SPU下所有SKU"
                @click="showDialog(row)"
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                title="删除SPU"
                @click="deleteSpu(row)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <!-- SPU下所有SKU -->
        <el-dialog :title="`${spu.spuName} => SKU列表`" :visible.sync="dialogTableVisible" :before-close="handleBeforeClose">
          <el-table :data="skuList" v-loading="loading">
            <el-table-column property="skuName" label="名称" width="150"></el-table-column>
            <el-table-column property="price" label="价格"></el-table-column>
            <el-table-column property="weight" label="重量"></el-table-column>
            <el-table-column property="skuDefaultImg" label="默认图片">
              <template slot-scope="{row}">
                <img :src="row.skuDefaultImg" alt="" width="100">
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
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
      <!-- .sync本质是绑定一个名字以"update:"开头的自定义事件，再由子组件携带数据来触发 -->
      <!-- <SpuForm v-show="spuFormVisible === true" :visible='spuFormVisible' @update:spuFormVisible='isShow=$event'></SpuForm> -->
      <SpuForm
        ref="spu"
        v-show="spuFormVisible === true"
        :visible.sync="spuFormVisible"
        @saveSuccess="saveSuccess"
        @cancelBack="cancelBack"
      ></SpuForm>
      <SkuForm v-show="skuFormVisible === true"></SkuForm>
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
      listDivVisible: true, // 只是为了传递给三级分类控制其可操作性
      spuFormVisible: false,
      skuFormVisible: false,
      // isShow: 'list', // 切换组件，'list'/'spu'/'sku'
      spu: {},
      skuList: [],
      dialogTableVisible: false,
      loading: true,
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
      this.getSpuList();
    },
    // 点击“新增SPU”, 切换到spu表单
    showAddSpuForm() {
      this.spuFormVisible = true;
      this.$refs.spu.initAddSpuData(this.category3Id); // 在SpuForm组件获取初始展示数据，注意一定要传category3Id过去
    },
    // 点击“修改SPU”，切换到展示了该spu数据的spu表单
    showUpdateSpuForm(row) {
      // row即当前spu
      this.spuId = row.id; // 为了后面保存成功返回的时候判断是新增返回还是修改返回
      this.spuFormVisible = true;
      this.$refs.spu.initUpdateSpuData(row); // 在SpuForm组件获取初始+当前spu数据
    },
    // 点击“添加SKU”
    showAddSkuForm(row) {
      this.skuFormVisible = true;
    },
    // spu中保存成功，要判断是新增返回还是修改返回
    saveSuccess() {
      if (this.spuId) {
        // 是修改返回，加载之前的页码
        this.getSpuList(this.page);
      } else {
        // 是新增返回，加载列表第一页即可
        this.getSpuList();
      }
      this.spuId = null; // 重置spuId，之后就可以重新操作
    },
    // spu中点取消返回
    cancelBack() {
      this.spuFormVisible = false; // 不需要:visible.sync="spuFormVisible"也可以关闭spu页面
      this.spuId = null;
    },
    // 查看SPU下所有SKU
    async showDialog(row) {
      this.spu = row;
      this.dialogTableVisible = true;
      const result = await this.$API.sku.getListBySpuId(row.id);
      this.skuList = result.data;
      this.loading = false;
    },
    handleBeforeClose() {
      this.loading = true;
      this.skuList = []; // 不清点话下次loading效果就没有了
      this.dialogTableVisible = false; // 不配这个回调点x默认关闭对话框，配了就要在里面手动关闭
    },
    async deleteSpu(row) {
      const result = await this.$API.spu.remove(row.id);
      if (result.code === 200) {
        this.$message.success("删除spu成功");
        this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1);
      } else {
        this.$message.success("删除spu成功");
      }
    },
  },
  // 控制三级列表可操作性
  // 可操作与否和list显示与否一致，和spu/sku显示与否是反着的
  watch: {
    spuFormVisible(newVal){
      this.listDivVisible = !newVal;
    },
    skuFormVisible(newVal){
      this.listDivVisible = !newVal;
    }
  },
  components: {
    SpuForm,
    SkuForm,
  },
};
</script>

