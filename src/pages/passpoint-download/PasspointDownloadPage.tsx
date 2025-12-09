import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { Spin } from 'antd';
import { passpointApi } from 'api/passpoint.api';
import AuthBackground from 'assets/images/auth/AuthBackground';
import { useFormik } from 'formik';
import { DocumentDownload } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import * as Yup from 'yup';
import Logo from 'components/atoms/logo';

interface DownloadParams {
  fullName: string;
  email: string;
  phoneNumber: string;
  osType: string; //'Windows' | 'Android' | 'iOS';
}

// Validation schema
const validationSchema = Yup.object({
  fullName: Yup.string().required('Họ tên không được để trống').min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: Yup.string().email('Email không hợp lệ').required('Email không được để trống'),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại không được để trống'),
  osType: Yup.string().required('Vui lòng chọn hệ điều hành')
});

const PasspointDownloadPage = () => {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const handleDownload = async (values: DownloadParams) => {
    try {
      setLoadingDownload(true);
      const response = await passpointApi.downloadPublic({ ...values });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/xml' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `passpoint-${values.fullName}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // dọn
      // dẹp URL
      enqueueSnackbar('Tải xuống thành công', {
        variant: 'success'
      });
    } catch (error) {
      enqueueSnackbar('Tải xuống thất bại', {
        variant: 'error'
      });
      console.error('Error downloading XML:', error);
    } finally {
      setLoadingDownload(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      osType: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleDownload(values);
    }
  });

  // const getOSLabel = (osType: string) => {
  //   switch (osType) {
  //     case 'android':
  //       return 'Android';
  //     case 'windows':
  //       return 'Windows';
  //     case 'ios':
  //       return 'iOS';
  //     default:
  //       return '';
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthBackground />
      <div className="max-w-[500px] m-auto">
        <Paper elevation={3} className="p-6 rounded-lg shadow-lg">
          <Box className="text-center mb-6">
            <Logo reverse to="/" />
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <DocumentDownload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Tải xuống Passpoint
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Vui lòng điền thông tin để tải xuống cấu hình Passpoint
            </Typography>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              name="fullName"
              label="Họ và tên"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
              variant="outlined"
              className="mb-5"
            />

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              variant="outlined"
              className="mb-5"
            />

            <TextField
              fullWidth
              name="phoneNumber"
              label="Số điện thoại"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              variant="outlined"
              className="mb-5"
            />

            <FormControl component="fieldset" className="w-full" error={formik.touched.osType && Boolean(formik.errors.osType)}>
              <FormLabel component="legend" className="text-gray-700 mb-2 font-bold">
                Hệ điều hành
              </FormLabel>
              <RadioGroup name="osType" value={formik.values.osType} onChange={formik.handleChange} className="space-y-2">
                <FormControlLabel
                  value="Android"
                  control={<Radio />}
                  label={
                    <div className="flex items-center space-x-2">
                      <span>Android</span>
                    </div>
                  }
                  className="bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                />
                {/* <FormControlLabel
                  value="Windows"
                  control={<Radio />}
                  label={
                    <div className="flex items-center space-x-2">
                      <span>Windows</span>
                    </div>
                  }
                  className="bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                /> */}
                <FormControlLabel
                  value="iOS"
                  control={<Radio />}
                  label={
                    <div className="flex items-center space-x-2">
                      <span>iOS</span>
                    </div>
                  }
                  className="bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                />
              </RadioGroup>
              {formik.touched.osType && formik.errors.osType && (
                <Alert severity="error" className="mt-2">
                  {formik.errors.osType}
                </Alert>
              )}
            </FormControl>

            <Spin spinning={loadingDownload}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-6 transition-colors"
                disabled={!formik.isValid}
              >
                Tải xuống Passpoint
              </Button>
            </Spin>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default PasspointDownloadPage;
