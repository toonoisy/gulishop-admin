<template>
  <div>
    <el-form :model="skuInfo" label-width="80px">
      <el-form-item label="SPU 名称">{{spu.spuName}}</el-form-item>
      <el-form-item label="SKU 名称">
        <el-input v-model="skuInfo.skuName" placeholder="SKU 名称"></el-input>
      </el-form-item>
      <!-- type="number" 原生input类型 -->
      <el-form-item label="价格(元)">
        <el-input type="number" v-model="skuInfo.price" placeholder="SKU 价格"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input type="number" v-model="skuInfo.weight" placeholder="SKU 重量"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" rows="4" v-model="skuInfo.skuDesc" placeholder="SKU 规格描述"></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="80px">
          <el-form-item
            :label="attrInfo.attrName"
            v-for="attrInfo in attrInfoList"
            :key="attrInfo.id"
          >
            <!--  -->
            <el-select placeholder="请选择" v-model="attrInfo.attrIdValueId">
              <el-option
                :label="attrValue.valueName"
                :value="`${attrInfo.id}:${attrValue.id}`"
                v-for="attrValue in attrInfo.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="spuSaleAttr in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <!--  -->
            <el-select placeholder="请选择" v-model="spuSaleAttr.saleAttrValueId">
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="spuSaleAttrValue in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table
          ref="multipleTable"
          style="width: 100%"
          border
          :data="spuImageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="图片" width="120">
            <template slot-scope="{row}">
              <img :src="row.imgUrl" alt width="100" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="120"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <el-button
                type="primary"
                size="small"
                @click="setDefault(row)"
                v-if="row.isDefault === '0'"
              >设为默认</el-button>
              <el-tag type="success" v-else>默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      skuInfo: {
        category3Id: 0,
        // isSale: 0,
        price: 0,
        skuAttrValueList: [],
        skuDefaultImg: "", // 默认图片
        skuDesc: "",
        skuImageList: [],
        skuName: "",
        skuSaleAttrValueList: [],
        spuId: 0,
        tmId: 0,
        weight: "",
      },
      spu: {},
      attrInfoList: [],
      spuImageList: [],
      spuSaleAttrList: [],
      selectedImgList: [], // 选中的图片列表
    };
  },
  methods: {
    // 初始化页面数据
    async initAddSkuData(spu, category1Id, category2Id) {
      this.spu = spu;
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      const promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      const promise3 = this.$API.sku.getSpuImageList(spu.id);
      const res = await Promise.all([promise1, promise2, promise3]);
      this.attrInfoList = res[0].data;
      this.spuSaleAttrList = res[1].data;
      let spuImageList = res[2].data;
      spuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      this.spuImageList = spuImageList;
    },

    handleSelectionChange(selection) {
      this.selectedImgList = selection;
    },

    setDefault(row) {
      this.spuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },

    cancel() {
      this.$emit("update:visible", false);
      this.resetData();
    },

    async save() {
      let { skuInfo, attrInfoList, spuSaleAttrList, selectedImgList } = this;

      /*
        目标：
        "skuImageList": [
          {
            // "id": 0,
            "imgName": "string",
            "imgUrl": "string",
            "isDefault": "string",
            // "skuId": 0,
            "spuImgId": 0
          }
        ]

        现有：
        id:6237
        imgName:"2e4fcc65ae5c4cf4.png"
        imgUrl:"http://182.92.128.115:8080/group1/M00/00/34/rBFUDF8sAWCAObIXAAK7B7cquMA524.png"
        isDefault:"1"
        spuId:150
      */
      skuInfo.skuImageList = selectedImgList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });

      /*
        "skuAttrValueList": [
          {
            "attrId": 0,
            // "id": 0,
            // "skuId": 0,
            "valueId": 0
          }
        ],
      */
      attrInfoList.forEach((item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          skuInfo.skuAttrValueList.push({ attrId, valueId });
        }
      });

      /*
        "skuSaleAttrValueList": [
          {
            // "id": 0,
            "saleAttrValueId": 0,
            // "skuId": 0,
            // "spuId": 0
          }
        ],
      */
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((acc, cur) => {
        if (cur.saleAttrValueId) {
          acc.push({ saleAttrValueId: cur.saleAttrValueId });
        }
        return acc;
      }, []);

      const result = await this.$API.sku.addUpdate(skuInfo);
      if (result.code === 200) {
        this.$message.success("保存sku成功");
        this.resetData();
        this.$emit("update:visible", false);
      } else {
        this.$message.error("保存sku失败");
      }
    },

    resetData() {
      this.skuInfo = {
        category3Id: 0,
        // isSale: 0,
        price: 0,
        skuAttrValueList: [],
        skuDefaultImg: "", // 默认图片
        skuDesc: "",
        skuImageList: [],
        skuName: "",
        skuSaleAttrValueList: [],
        spuId: 0,
        tmId: 0,
        weight: "",
      };
      this.spu = {};
      this.attrInfoList = [];
      this.spuImageList = [];
      this.spuSaleAttrList = [];
      this.selectedImgList = []; // 选中的图片列表
    },
  },
};
</script>

<style lang="less" scoped>
</style>
