<template>
  <el-card class="sku-list">
    <el-table style="width: 100%" border :data="skuList">
      <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
      <el-table-column prop="skuName" label="名称"></el-table-column>
      <el-table-column prop="skuDesc" label="描述"></el-table-column>
      <el-table-column label="默认图片">
        <template slot-scope="{row}">
          <img :src="row.skuDefaultImg" alt width="100" />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量(KG)"></el-table-column>
      <el-table-column prop="price" label="价格(元)"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row}">
          <HintButton type="info" icon="el-icon-top" size="mini" title="上架" circle></HintButton>
          <HintButton type="success" icon="el-icon-bottom" size="mini" title="下架" circle></HintButton>
          <HintButton type="primary" icon="el-icon-edit" size="mini" title="修改" circle></HintButton>
          <HintButton
            type="info"
            icon="el-icon-info"
            size="mini"
            title="查看详情"
            circle
            @click="showSkuInfo(row.id)"
          ></HintButton>
          <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除" circle></HintButton>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align: center"
      @size-change="handleSizeChange"
      @current-change="getSkuList"
      :current-page="page"
      :page-sizes="[10, 15, 20]"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
    ></el-pagination>

    <el-drawer :visible.sync="drawerVisible" direction="rtl" :with-header="false" size="50%">
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{skuInfo.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{skuInfo.price}}</el-col>
      </el-row>

      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="18">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="value in skuInfo.skuAttrValueList"
            :key="value.id"
          >{{value.attrId + '-' + value.valueId}}</el-tag>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="5">销售属性</el-col>
        <el-col :span="18">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="value in skuInfo.skuSaleAttrValueList"
            :key="value.id"
          >{{value.id + '-' + value.saleAttrValueId}}</el-tag>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel trigger="click" height="150px" class="sku-carousel">
            <el-carousel-item v-for="img in skuInfo.skuImageList" :key="img.id">
              <img :src="img.imgUrl" alt />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </el-card>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      skuList: [],
      page: 1,
      limit: 10,
      total: 0,
      drawerVisible: false,
      skuInfo: {},
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    async getSkuList(page = 1) {
      this.page = page;
      const res = await this.$API.sku.getList(this.page, this.limit);
      this.skuList = res.data.records;
      this.total = res.data.total;
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSkuList();
    },
    async showSkuInfo(id) {
      this.drawerVisible = true;
      const res = await this.$API.sku.get(id);
      this.skuInfo = res.data;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
    1. 为什么必须加/deep/才能修改Carousel组件的样式?,
      声明了scoped, 不用deep不能修改子组件的非标签样式(也就是Carousel组件内部的子标签样式)
      用了deep: 不会对目标标签有当前组件的data属性选择的要求
    2. 为什么不加/deep/能修改Row/Col组件的样式?
      我们修改的是Row/Col根标签样式(它有当前组件的data属性)
  */
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }

  .sku-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 400px;
      height: 400px;
    }
    /deep/ .el-carousel__container {
      height: 400px !important;
    }
    /deep/ .el-carousel__indicator {
      button {
        background-color: hotpink;
      }
      &.is-active {
        button {
          background-color: green;
        }
      }
    }
  }
}
</style>
