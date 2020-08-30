<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <!-- 把listDivVisible传给三级分类组件，用来控制其可操作性 -->
      <CategorySelector @changeCategory="changeCategory" :listDivVisible='listDivVisible'></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="listDivVisible">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
        >添加属性</el-button>
        <el-table border :data="attrInfoList">
          <el-table-column type="index" label="序号" width="100" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名" width="150"></el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{row}">
              <el-tag
                type="info"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row}">
              <HintButton
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                title="修改"
                @click="showUpdateDiv(row)"
              ></HintButton>
              <el-popconfirm title="确定删除该属性吗？" @onConfirm="deleteAttr(row)">
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!listDivVisible">
        <el-form :inline="true" :model="form" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="form.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="addAttrValue" :disabled="!form.attrName">添加属性值</el-button>
        <el-button @click="listDivVisible = true">取消</el-button>
        <el-table border :data="form.attrValueList" style="margin: 20px 0">
          <el-table-column type="index" label="序号" width="100" align="center"></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row, $index}">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值"
                size="mini"
                @blur="toView(row)"
                @keyup.enter.native="toView(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: inline-block; width: 100%; height: 100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{$index}">
              <el-popconfirm title="确定删除该属性值吗？" @onConfirm="form.attrValueList.splice($index, 1)">
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save" :disabled="form.attrValueList.length === 0">保存</el-button>
        <el-button @click="listDivVisible = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      attrInfoList: [],
      category1Id: "",
      category2Id: "",
      category3Id: "",
      listDivVisible: true,
      form: {
        attrName: "", // 属性名
        attrValueList: [], // 属性名下的属性值
        categoryId: "",
        categoryLevel: "",
      },
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
        this.getAttrInfoList();
      }
    },
    async getAttrInfoList() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrInfoList = result.data;
      }
    },
    // 点击“添加属性”
    showAddDiv() {
      this.listDivVisible = false;
      // 清空form，顺便给到id（固定是category3Id）
      this.form = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    // 修改数据（做修改操作时修改的对象和原数据不能是同一个）
    showUpdateDiv(row) {
      this.listDivVisible = false; // 切换到修改div
      this.form = cloneDeep(row); // 因为当前属性row里面有对象属性，所以要深拷贝
      // 给所有属性值加isEdit标示，false即为查看模式，显示span而不是input
      this.form.attrValueList.forEach((item) => {
        // item.isEdit = false; // 错的
        this.$set(item, "isEdit", false); // 数据劫持早就完了，后期用vm.$set或Vue.set才能添加响应式数据
      });
    },
    // 点击“添加属性值”
    addAttrValue() {
      // 占坑（push了table就会多一行，input就出现了），用户输入之后数据才收集好
      this.form.attrValueList.push({
        // vue中的push等方法是重写过的，调用可以触发视图更新
        valueName: "",
        attrId: this.form.id, // 有就在form中拿（修改时），没有就undefined
        isEdit: true, // 给新增的属性值加一个isEdit标示，true即为编辑模式，显示input而不是span
      });
    },
    // input失焦或enter键抬起(原生事件)切换到查看模式（显示span），切换前要判断输入的值是否有效
    toView(row) {
      // 输入内容trim后不能为空串
      if (row.valueName.trim() === "") {
        this.$message.warning("内容不能为空");
        row.valueName = "";
        return;
      }
      // 属性值不能同名
      let repeat = this.form.attrValueList.some((item) => {
        if (item !== row) {
          // 排除自己，看剩下的有没有跟自己同名
          return item.valueName.trim() === row.valueName.trim();
        }
      });
      if (repeat) {
        this.$message.warning("属性值不能重名");
        row.valueName = "";
        return;
      }

      row.isEdit = false;
    },
    // 点击span切换到编辑模式（显示input）
    toEdit(row, index) {
      row.isEdit = true;
      // 数据变化速度快，视图更新赶不上，所以要等页面最近一次更新完再做
      this.$nextTick(() => {
        this.$refs[index].focus(); // 给当前input聚焦
      });
    },
    async save() {
      let attr = this.form;
      // 保存前要过滤掉属性值为空的，并且去掉之前添加的isEdit属性
      attr.attrValueList = attr.attrValueList.filter(item => {
        if (item.valueName !== "") {
          delete item.isEdit;
          return true;
        }
      });

      // 如果当前属性没有有效属性值，不能保存
      if (attr.attrValueList.length === 0) {
        this.$message.warning("请先添加有效属性值");
        return;
      };

      const result = await this.$API.attr.addOrUpdate(this.form);
      if (result.code === 200) {
        this.$message.success("保存成功");
        this.getAttrInfoList();
        this.listDivVisible = true;
      } else {
        this.$message.error("保存失败");
      }
    },
    async deleteAttr(row) {
      const result = await this.$API.attr.delete(row.id);
      if (result.code === 200) {
        this.$message.success("删除属性成功");
        this.getAttrInfoList();
      } else {
        this.$message.error("删除属性失败");
      }
    },
  },
};
</script>

