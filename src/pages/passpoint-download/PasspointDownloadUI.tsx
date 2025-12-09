'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Fade,
  Grid,
  Slide,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { passpointApi } from 'api/passpoint.api';
import AuthBackground from 'assets/images/auth/AuthBackground';
import Logo from 'components/atoms/logo';
import { Field, Form, Formik } from 'formik';
import { Android, Apple, Call, InfoCircle, Profile, Sms, TickCircle, VideoPlay } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import * as Yup from 'yup';

interface DownloadParams {
  fullName: string;
  email: string;
  phoneNumber: string;
  osType: string; //'Windows' | 'Android' | 'iOS';
}

const validationSchema = Yup.object({
  // fullName: Yup.string().min(2, "Họ tên phải có ít nhất 2 ký tự").required("Vui lòng nhập họ tên"),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .required('Vui lòng nhập số điện thoại')
  // email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
});

const steps = ['Xem hướng dẫn', 'Tải xuống'];

const PasspointDownloadUI = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [videoWatched, setVideoWatched] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [downloadingOS, setDownloadingOS] = useState<string>('');

  const handleFormSubmit = (values: any) => {
    setFormData(values);
    setActiveStep(2);
  };

  console.log({ formData });

  const handleVideoEnd = () => {
    setVideoWatched(true);
    // setActiveStep(1)
  };

  const handleDownload = async (values: any, osType: string) => {
    try {
      setLoadingDownload(true);
      setDownloadingOS(osType);

      const downloadParams: DownloadParams = {
        ...values,
        osType
      };

      const response = await passpointApi.downloadPublic(downloadParams);

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/xml' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `passpoint-${values.fullName || 'config'}-${osType}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(`Tải xuống thành công cho ${osType}`, {
        variant: 'success'
      });
    } catch (error) {
      enqueueSnackbar('Tải xuống thất bại', {
        variant: 'error'
      });
      console.error('Error downloading XML:', error);
    } finally {
      setLoadingDownload(false);
      setDownloadingOS('');
    }
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <Box
      sx={{
        minHeight: '100vh'
      }}
    >
      <AuthBackground />
      <Container className="max-w-[700px] p-5">
        {/* Header */}
        <Fade in timeout={1000}>
          <Box mb={3}>
            <Logo reverse to="/" />
            <Typography
              mt={3}
              textAlign="center"
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: '800'
              }}
              className="text-blue-500"
            >
              Tải xuống Passpoint
            </Typography>
            <Typography
              textAlign="center"
              variant="h6"
              sx={{
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              Kết nối WiFi tự động và an toàn cho thiết bị của bạn
            </Typography>

            {/* Enhanced Progress Stepper */}

            <div className="py-3">
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#4caf50'
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: '#2196f3'
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: '2rem'
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    borderRadius: '50%'
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    borderRadius: '50%'
                    // color: 'white',
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontWeight: 600,
                          fontSize: {
                            xs: '0.875rem', // ~14px cho mobile
                            sm: '1rem' // ~16px từ sm breakpoint trở lên
                          }
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
          </Box>
        </Fade>

        {/* Step 1: Video Tutorial */}
        {activeStep === 0 && (
          <Slide direction="up" in mountOnEnter unmountOnExit>
            <Card
              sx={{
                mb: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 4 }
                }}
              >
                <Box display="flex" alignItems="center" mb={4}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #f44336, #ff5722)',
                      mr: 2
                    }}
                  >
                    <VideoPlay size="28" color="#ffffff" variant="Bold" />
                  </Box>
                  <Typography variant="h4" fontWeight="700">
                    Video hướng dẫn
                  </Typography>
                </Box>

                {/* <Paper
                                    sx={{
                                        p: 2,
                                        mb: 4,
                                        borderRadius: 2,
                                        background: 'linear-gradient(145deg, #f0f2f5, #e1e5e9)',
                                    }}
                                > */}
                {/* Video */}
                <div className="mb-5">
                  <video
                    width="100%"
                    height="100%"
                    controls
                    onEnded={handleVideoEnd}
                    style={{ borderRadius: 12, objectFit: 'cover' }}
                    poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
                  >
                    <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
                {/* </Paper> */}

                <Alert
                  severity="info"
                  icon={<InfoCircle size="20" />}
                  sx={{
                    mb: 4,
                    background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1))',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    '& .MuiAlert-message': {
                      fontWeight: 500
                    }
                  }}
                >
                  Vui lòng xem video hướng dẫn để hiểu cách cài đặt và sử dụng Passpoint trên thiết bị của bạn.
                </Alert>

                {/* Nút chính */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setActiveStep(1)}
                  disabled={!videoWatched}
                  sx={{
                    width: '100%',
                    py: 2,
                    borderRadius: 2,
                    background: videoWatched ? 'linear-gradient(45deg, #4caf50, #8bc34a)' : 'linear-gradient(45deg, #bdbdbd, #9e9e9e)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: videoWatched ? '0 6px 20px rgba(76, 175, 80, 0.4)' : 'none',
                    '&:hover': {
                      background: videoWatched ? 'linear-gradient(45deg, #45a049, #7cb342)' : 'linear-gradient(45deg, #bdbdbd, #9e9e9e)',
                      transform: videoWatched ? 'translateY(-2px)' : 'none',
                      boxShadow: videoWatched ? '0 8px 25px rgba(76, 175, 80, 0.5)' : 'none'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  startIcon={videoWatched ? <TickCircle size="20" /> : <InfoCircle size="20" />}
                >
                  Tiếp tục
                </Button>

                {/* Nút bỏ qua */}
                <Button
                  variant="text"
                  size="large"
                  onClick={() => setActiveStep(1)}
                  sx={{
                    mt: 2,
                    width: '100%',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#1976d2'
                  }}
                  startIcon={<VideoPlay size="20" />}
                >
                  Bỏ qua hướng dẫn
                </Button>
              </CardContent>
            </Card>
          </Slide>
        )}

        {/* Step 2: Information Form */}
        {activeStep === 1 && (
          <Slide direction="up" in mountOnEnter unmountOnExit>
            <Card
              sx={{
                mb: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 4 }
                }}
              >
                <Box mb={2}>
                  <Button
                    variant="text"
                    onClick={handleBack}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                    startIcon={<span style={{ fontSize: 18, lineHeight: 1 }}>←</span>}
                  >
                    Xem hướng dẫn
                  </Button>
                </Box>
                <Box display="flex" alignItems="center" mb={4}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                      mr: 2
                    }}
                  >
                    <Profile size="28" color="#ffffff" variant="Bold" />
                  </Box>
                  <Typography variant="h4" fontWeight="700">
                    Thông tin cá nhân
                  </Typography>
                </Box>

                <Formik
                  initialValues={{
                    fullName: '',
                    phoneNumber: '',
                    email: ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleFormSubmit}
                >
                  {({ errors, touched, isValid, dirty, values }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field name="phoneNumber">
                            {({ field }: any) => (
                              <TextField
                                required
                                {...field}
                                fullWidth
                                label="Số điện thoại"
                                variant="outlined"
                                error={touched.phoneNumber && !!errors.phoneNumber}
                                helperText={touched.phoneNumber && errors.phoneNumber}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.8)',
                                    '&:hover fieldset': {
                                      borderColor: '#4caf50'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#4caf50',
                                      boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                    }
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#4caf50'
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <Call size="20" color="#666" style={{ marginRight: 8 }} />
                                }}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={12}>
                          <Field name="fullName">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Họ và tên"
                                variant="outlined"
                                error={touched.fullName && !!errors.fullName}
                                helperText={touched.fullName && errors.fullName}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.8)',
                                    '&:hover fieldset': {
                                      borderColor: '#4caf50'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#4caf50',
                                      boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                    }
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#4caf50'
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <Profile size="20" color="#666" style={{ marginRight: 8 }} />
                                }}
                              />
                            )}
                          </Field>
                        </Grid>

                        <Grid item xs={12}>
                          <Field name="email">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Email"
                                variant="outlined"
                                type="email"
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.8)',
                                    '&:hover fieldset': {
                                      borderColor: '#4caf50'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#4caf50',
                                      boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)'
                                    }
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#4caf50'
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <Sms size="20" color="#666" style={{ marginRight: 8 }} />
                                }}
                              />
                            )}
                          </Field>
                        </Grid>

                        <Grid item xs={12}>
                          <Alert
                            severity="info"
                            icon={<InfoCircle size="20" />}
                            sx={{
                              background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1))',
                              border: '1px solid rgba(33, 150, 243, 0.3)',
                              '& .MuiAlert-message': {
                                fontWeight: 500
                              }
                            }}
                          >
                            Thông tin của bạn sẽ được sử dụng để tạo file cấu hình Passpoint cá nhân hóa.
                          </Alert>
                        </Grid>

                        <Grid item xs={12}>
                          <Grid container spacing={3} mt={2}>
                            <Grid item xs={12} sm={6}>
                              <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={!isValid || !values.phoneNumber || loadingDownload}
                                onClick={() => handleDownload(values, 'Android')}
                                sx={{
                                  py: 1.5,
                                  borderRadius: 2,
                                  background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                                  fontSize: '1.2rem',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #45a049, #7cb342)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.5)'
                                  },
                                  transition: 'all 0.3s ease',
                                  '& .MuiButton-startIcon': {
                                    marginRight: 1,
                                    '& > svg': {
                                      fontSize: 28, // ép icon về 28px
                                      width: 28,
                                      height: 28
                                    }
                                  }
                                }}
                                startIcon={
                                  loadingDownload && downloadingOS === 'Android' ? (
                                    <CircularProgress size={20} color="inherit" />
                                  ) : (
                                    <Android />
                                  )
                                }
                              >
                                {loadingDownload && downloadingOS === 'Android' ? 'Đang tải...' : 'Tải cho Android'}
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={!isValid || !values.phoneNumber || loadingDownload}
                                onClick={() => handleDownload(values, 'iOS')}
                                sx={{
                                  py: 1.5,
                                  borderRadius: 2,
                                  background: 'linear-gradient(45deg, #000, #424242)',
                                  fontSize: '1.2rem',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #212121, #616161)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)'
                                  },
                                  transition: 'all 0.3s ease',
                                  '& .MuiButton-startIcon': {
                                    marginRight: 1,
                                    '& > svg': {
                                      fontSize: 28, // ép icon về 28px
                                      width: 28,
                                      height: 28,
                                      marginBottom: '4px'
                                    }
                                  }
                                }}
                                startIcon={
                                  loadingDownload && downloadingOS === 'iOS' ? <CircularProgress size={20} color="inherit" /> : <Apple />
                                }
                              >
                                {loadingDownload && downloadingOS === 'iOS' ? 'Đang tải...' : 'Tải cho iOS'}
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </Slide>
        )}
      </Container>
    </Box>
  );
};

export default PasspointDownloadUI;
