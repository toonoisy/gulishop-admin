<template>
  <div>
    <el-form ref="form" label-width="100px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :label="trademark.tmName"
            :value="trademark.id"
            v-for="trademark in trademarkList"
            :key="trademark.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input type="textarea" rows="4" placeholder="SPU描述" v-model="spuInfo.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- file-list  上传的文件列表, 例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}] -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="unUsedBaseSaleAttrList.length > 0? `还有${unUsedBaseSaleAttrList.length}个未选择` : '没有更多可选'"
          v-model="saleAttrIdName"
        >
          <!-- label  若不设置则默认与 value 相同 -->
          <el-option
            :label="unUsedBaseSaleAttr.name"
            :value="`${unUsedBaseSaleAttr.id}:${unUsedBaseSaleAttr.name}`"
            v-for="unUsedBaseSaleAttr in unUsedBaseSaleAttrList"
            :key="unUsedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>
        <el-table style="width: 100%; margin-top: 20px" border :data="spuInfo.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150"></el-table-column>
          <el-table-column prop="spuSaleAttrValueList" label="属性值名称列表">
            <template slot-scope="{row}">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1);"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>
              <!-- row.saleAttrValueName 把输入的属性值暂存在属性身上，方便取用 -->
              <el-input
                class="input-new-tag"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 新增属性值</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{$index}">
              <el-popconfirm
                title="确定删除该销售属性吗？"
                @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1);"
              >
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  title="删除销售属性"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
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
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      trademarkList: [],
      baseSaleAttrList: [],
      spuImageList: [], // 点击修改进来获取到的图片
      imglist: [], // 经过添加/移除操作后收集的图片，后面参数要整理成和spuImageList一样
      spuInfo: {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [],
      },
      spu: "", // 初始化空串或空对象无所谓，后面处理
      saleAttrIdName: "",
    };
  },
  methods: {
    // 移除图片
    handleRemove(file, fileList) {
      // console.log(file, fileList); // file 被移除图片信息，fileList 所剩图片信息列表
      this.imglist = fileList;
    },
    // 大图预览，搬官网的不用改
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 图片上传成功
    handleUploadSuccess(response, file, fileList) {
      // console.log(response); // 上传成功的响应，data是图片url
      this.imglist = fileList;
      console.log(this.imglist);
    },

    // 获取添加spu页面初始数据
    initAddSpuData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      this.getTrademarkList(); // 所有商标
      this.getBaseSaleAttrList(); // 所有基础销售属性
    },
    async getTrademarkList() {
      const result = await this.$API.trademark.reqTrademarkList();
      this.trademarkList = result.data;
    },
    async getBaseSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.baseSaleAttrList = result.data;
    },

    // 获取修改spu页面初始+当前spu数据
    initUpdateSpuData(spu) {
      this.spu = spu; // 保存父组件传过来的spu （row）
      this.spuInfo.category3Id = spu.category3Id;
      this.getTrademarkList(); // 所有商标
      this.getBaseSaleAttrList(); // 所有基础销售属性
      this.getSpuById(spu.id); // 指定id的spu信息
      this.getSpuImageList(spu.id); // 指定id的spu下的所有图片
    },
    async getSpuById(spuId) {
      const result = await this.$API.spu.get(spuId);
      this.spuInfo = result.data;
    },
    async getSpuImageList(spuId) {
      const result = await this.$API.sku.getSpuImageList(spuId);
      // 把返回的数据整理成upload组件需要的参数格式，图片才能够正常展示
      let spuImageList = result.data;
      spuImageList.forEach((item) => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      });
      this.spuImageList = spuImageList;
    },

    // 点击“添加销售属性”
    addSaleAttr() {
      /*
        {
          "spuId": 1038,
          "baseSaleAttrId": 1,
          "saleAttrName": "选择颜色",
          "spuSaleAttrValueList": [],
        }
      */
      let spuId = this.spu.id;
      let spuSaleAttrValueList = [];
      let [baseSaleAttrId, saleAttrName] = this.saleAttrIdName.split(":");
      baseSaleAttrId *= 1; // baseSaleAttrId值要求是number
      let saleAttr = {
        spuId,
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList,
      };
      this.spuInfo.spuSaleAttrList.push(saleAttr);
    },

    // 点击“新增属性值”，给当前属性名row添加isEdit标识true表示进入编辑模式（之所以直接添加给属性名是因为整体只有一个输入框），注意后面要删掉这个属性
    showInput(row) {
      this.$set(row, "isEdit", true);
      // 自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    // 失焦或enter键抬起，即可添加属性值，添加前要判断值是否有效或者重名
    handleInputConfirm(row) {
      /*
        {
          "spuId": 1038,
          "baseSaleAttrId": 1,
          "saleAttrValueName": "黄",
          "saleAttrName": "选择颜色",
        },
      */
      // 1. 收集属性
      let spuId = this.spu.id;
      // saleAttrValueName是在收集input值的时候暂存在row上的
      let { baseSaleAttrId, saleAttrValueName, saleAttrName } = row;
      // 2. 创建符合格式要求的对象
      let attrValue = {
        spuId,
        baseSaleAttrId,
        saleAttrValueName,
        saleAttrName,
      };
      // 3.1 判断属性值是否为空
      if (saleAttrValueName.trim() === "") return;
      let repeat = row.spuSaleAttrValueList.some((item) => {
        return item.saleAttrValueName === attrValue.saleAttrValueName;
      });
      // 3.2 判断属性值是否有重名
      if (repeat) {
        this.$message.warning("属性值不能重名");
      }
      // 4. 将属性值对象添加到对应的属性值列表
      row.spuSaleAttrValueList.push(attrValue);
      // 5. 关闭编辑模式
      row.isEdit = false;
      // 6. 添加完了清空输入框
      row.saleAttrValueName = "";
    },

    async save() {
      // 整理参数，spuInfo目前还缺category3Id/spuImageList
      /*
        "spuImageList": [
          {
            "id": 0,
            "imgName": "string",
            "imgUrl": "string",
            "spuId": 0
          }
        ],
      */
     let { spu, imglist, spuInfo } = this;
      // 1. 把imglist整理成spuImageList
      imglist = imglist.map(item => {
        return {
          imgName: item.imgName || item.name,
          imgUrl: item.imgUrl || item.response.data,
          spuId: spu.id,
        }
      });
      spuInfo.spuImageList = imglist;
      // 2. category3Id没必要加上，因为如果是新spu，内部初始是没有东西的
      // spuInfo.category3Id = spu.category3Id;
      // 3. 删除自己添加的属性
      spuInfo.spuSaleAttrList.forEach(item => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      })
      console.log(spuInfo);

      // 4. 参数整理好了就发请求
      const result = await this.$API.spu.addUpdate(spuInfo);
      // 如果成功
      if (result.code === 200) {
        // 提示成功
        this.$message.success("保存成功");
        // 关闭当前页面，返回list
        this.$emit('saveSuccess'); // 父组件要判断是新增返回还是修改返回从而决定加载页码
        this.$emit("update:visible", false);
      } else {
        this.$message.error("保存失败");
      }
      this.resetData();
    },

    cancel() {
      // this.$emit("update:visible", false);
      this.$emit('cancelBack'); // 不需要:visible.sync="spuFormVisible"也可以关闭spu页面
      this.resetData();
    },

    resetData() {
      this.dialogImageUrl = "";
      this.dialogVisible = false;
      this.trademarkList = [];
      this.baseSaleAttrList = [];
      this.spuImageList = [];
      this.imglist = [];
      this.spuInfo = {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [],
      };
      this.spu = "";
      this.saleAttrIdName = "";
    },
  },
  computed: {
    // 未使用的基础销售属性列表：baseSaleAttrList中有但spuSaleAttrList中没有
    unUsedBaseSaleAttrList() {
      return this.baseSaleAttrList.filter((baseSaleAttr) =>
        this.spuInfo.spuSaleAttrList.every(
          (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      );
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
