<template>
  <div>
    <!-- 新增按钮 -->
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">新增</el-button>
    <!-- 对话框 -->
    <el-dialog :title="`${form.id? '修改':'添加'}品牌`" :visible.sync="dialogVisible">
      z style="width: 80%">
        <!-- 品牌名称 -->
        <!-- label-width 不写默认独占一行 -->
        <el-form-item label="品牌名称" label-width="100px">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <!-- 品牌logo -->
        <el-form-item label="品牌LOGO" label-width="100px">
          <!-- 上传 -->
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            action="/dev-api/admin/product/fileUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 取消确认按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 表格 -->
    <el-table :data="tmList" border style="width: 100%; margin: 20px 0">
      <!-- 不指定width则均分 -->
      <el-table-column type="index" width="100" label="序号" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column property="logoUrl" label="品牌logo">
        <!-- slot-scope="{row, column, $index}" -->
        <template slot-scope="{row}">
          <img :src="row.logoUrl" alt width="100px" />
        </template>
      </el-table-column>
      <el-table-column property label="操作">
        <template slot-scope="{row}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTm(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      style="text-align: center"
      @size-change="handleSizeChange"
      @current-change="getTmList"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper, ->, sizes, total"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      tmList: [],
      page: 1,
      limit: 3,
      total: 0,
      dialogVisible: false,
      form: {
        tmName: "",
        logoUrl: "",
      },
    };
  },
  mounted() {
    this.getTmList();
  },
  methods: {
    async getTmList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.reqTrademarkList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.tmList = result.data.records;
        this.total = result.data.total || 0;
      }
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getTmList();
    },
    handleAvatarSuccess(res, file) {
      this.form.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      const fileTypes = ['image/jpeg', 'image/png'];
      const isJPGOrPNG = fileTypes.includes(file.type);
      // const isJPGOrPNG = fileTypes.indexOf(file.type) !== -1;
      const isLt500K = file.size / 1024 < 500;
      if (!isJPGOrPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!');
      }
      if (!isLt500K) {
        this.$message.error('上传图片大小不能超过 500KB!');
      }
      return isJPGOrPNG && isLt500K;
    },
    showAddDialog(row) {
      this.dialogVisible = true;
      // 每次点新增都清空dialog表单收集的数据
      this.form = {
        tmName: "",
        logoUrl: "",
      };
    },
    showUpdateDialog(row) {
      this.dialogVisible = true;
      // // 修改form时会直接修改row（是同一个对象），确认和取消形同虚设
      // this.form = row;
      this.form = {...row}; // 浅拷贝一个新对象，和row不是同一个
    },
    // 同时处理新增和修改
    async save() {
      const result = await this.$API.trademark.addOrUpdate(this.form);
      try {
        if (result.code === 200) {
          this.$message.success("保存成功")
          this.dialogVisible = false
          this.getTmList()
          // // 添加成功跳到最末页
          // this.getTmList(this.pageCount);
        } else {
          this.$message.error("保存失败")
        }
      } catch (error) {
        this.$message.error('请求失败 ' + error.message)
      }
    },
    deleteTm(row) {
      this.$confirm(`确认要删除${row.tmName}吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(async () => {
        try {
          const result = await this.$API.trademark.delete(row.id);
          if (result.code === 200) {
            this.$message.success('删除品牌成功')
          // 如果当前页条数删完了，跳到前一页
          this.getTmList(this.tmList.length > 1? this.page : this.page - 1);
          } else {
            this.$message.error('删除品牌失败')
          }
        } catch (error) {
          this.$message.error('请求失败 ' + error.message)
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
  },
  // computed: {
  //   pageCount() {
  //     if (this.total % this.limit === 0) {
  //       return this.total / this.limit + 1;
  //     } else {
  //       return Math.ceil(this.total / this.limit);
  //     }
  //   }
  // }
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
