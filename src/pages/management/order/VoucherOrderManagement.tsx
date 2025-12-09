import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import useHandleWifiOrder from 'hooks/useHandleWifiOrder';
import {
  Edit as EditIcon,
  Trash as TrashIcon,
  User as UserIcon,
  Eye,
  TicketDiscount,
  DollarCircle,
  Calendar,
  InfoCircle,
  DocumentText,
  CloseCircle
} from 'iconsax-react';
import React, { useEffect, useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { RootState, useSelector } from 'store';
import { Order } from 'types/order';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

const VoucherOrderManagement: React.FC = () => {
  const intl = useIntl();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const { fetchWifiOrder, loadingOrder, orders, queryOrder, setQueryOrder, totalOrder, totalPages, updateOrderStatus } = useHandleWifiOrder(
    {
      initQuery: {
        page: 1,
        pageSize: 50,
        filters: ''
      }
    }
  );

  useEffect(() => {
    fetchWifiOrder();
  }, [currentSite]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const completed = orders.filter((o) => o.status === 'Completed').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    return { total, pending, completed, cancelled, totalRevenue };
  }, [orders]);

  const columns = useMemo<Column<Order>[]>(
    () => [
      {
        Header: intl.formatMessage({ id: 'order-number' }),
        accessor: 'order_number',
        Cell: ({ value }: CellProps<Order>) => (
          <Typography variant="body2" fontWeight="600" color="primary">
            #{value}
          </Typography>
        )
      },
      {
        Header: intl.formatMessage({ id: 'user' }),
        accessor: 'user_id',
        Cell: ({ value }: CellProps<Order>) => (
          <Box display="flex" alignItems="center" gap={1}>
            <UserIcon size="18" color="#1976d2" />
            <Typography variant="body2">{value}</Typography>
          </Box>
        )
      },
      {
        Header: intl.formatMessage({ id: 'total-amount' }),
        accessor: 'total',
        Cell: ({ value }: CellProps<Order>) => (
          <Typography variant="body2" fontWeight="500">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
          </Typography>
        )
      },
      {
        Header: intl.formatMessage({ id: 'status' }),
        accessor: 'status',
        Cell: ({ value }: CellProps<Order>) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'Completed':
                return 'success';
              case 'Pending':
                return 'warning';
              case 'Cancelled':
                return 'error';
              default:
                return 'default';
            }
          };

          return <Chip label={value} color={getStatusColor(value)} size="small" />;
        }
      },
      {
        Header: intl.formatMessage({ id: 'created-date' }),
        accessor: 'created_date',
        Cell: ({ value }: CellProps<Order>) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Calendar size="16" color="#666" />
            <Typography variant="body2">{dayjs(value).format('DD/MM/YYYY HH:mm')}</Typography>
          </Box>
        )
      },
      {
        Header: intl.formatMessage({ id: 'actions' }),
        Cell: ({ row }: CellProps<Order>) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title={intl.formatMessage({ id: 'view-details' })}>
              <IconButton size="small" color="primary" onClick={() => handleViewOrder(row.original)}>
                <Eye size="18" />
              </IconButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'edit' })}>
              <IconButton size="small" color="info" onClick={() => handleEditOrder(row.original)}>
                <EditIcon size="18" />
              </IconButton>
            </Tooltip>
            <Tooltip title={intl.formatMessage({ id: 'delete' })}>
              <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id)}>
                <TrashIcon size="18" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [intl]
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('view');
    setOpenDialog(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('edit');
    setOpenDialog(true);
  };

  const handleCloseModal = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus({
        order_id: selectedOrder.id,
        status: selectedOrder.status
      });

      enqueueSnackbar(intl.formatMessage({ id: 'update-success' }), { variant: 'success' });
      handleCloseModal();
      fetchWifiOrder();
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), { variant: 'error' });
    }
  };

  const handleEditStatus = (newStatus: string) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm(intl.formatMessage({ id: 'confirm-delete-order' }))) {
      enqueueSnackbar(intl.formatMessage({ id: 'delete-success' }), { variant: 'success' });
      fetchWifiOrder();
    }
  };

  const handlePageChange = (newPage: number) => {
    setQueryOrder({ ...queryOrder, page: newPage });
    fetchWifiOrder();
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    setViewMode('edit');
    setOpenDialog(true);
  };

  const handleRowClick = (row: Order) => {
    handleViewOrder(row);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Statistics Section */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={intl.formatMessage({ id: 'total-orders' })}
            value={stats.total}
            icon={<DocumentText size={32} color="#1976d2" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={intl.formatMessage({ id: 'pending-orders' })}
            value={stats.pending}
            icon={<InfoCircle size={32} color="#ed6c02" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={intl.formatMessage({ id: 'completed-orders' })}
            value={stats.completed}
            icon={<TicketDiscount size={32} color="#2e7d32" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={intl.formatMessage({ id: 'cancelled-orders' })}
            value={stats.cancelled}
            icon={<CloseCircle size={32} color="#d32f2f" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title={intl.formatMessage({ id: 'total-revenue' })}
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarCircle size={32} color="#9c27b0" />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Table Section */}
      <MainCard content={false}>
        <GeneralizedTableV2
          isLoading={loadingOrder}
          columns={columns}
          data={orders}
          totalResults={totalOrder}
          totalPages={totalPages}
          size={queryOrder.pageSize}
          currentPage={queryOrder.page}
          onAddNew={handleAdd}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onSearch={(value) => setQueryOrder((prev) => ({ ...prev, filters: value }))}
          sortColumns="index"
          isDecrease={false}
        />
      </MainCard>

      {/* Order Detail/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseModal} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  {viewMode === 'view' ? intl.formatMessage({ id: 'order-details' }) : intl.formatMessage({ id: 'edit-order' })} #
                  {selectedOrder.order_number}
                </Typography>
                <Chip label={selectedOrder.status} color={selectedOrder.status === 'Completed' ? 'success' : 'warning'} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Order Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {intl.formatMessage({ id: 'order-information' })}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <UserIcon size={20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {intl.formatMessage({ id: 'user-id' })}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {selectedOrder.user_id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <DollarCircle size={20} color="#2e7d32" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {intl.formatMessage({ id: 'total-amount' })}
                      </Typography>
                      <Typography variant="body1" fontWeight="500" color="success.main">
                        {formatCurrency(selectedOrder.total)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Calendar size={20} color="#666" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {intl.formatMessage({ id: 'created-date' })}
                      </Typography>
                      <Typography variant="body1">{dayjs(selectedOrder.created_date).format('DD/MM/YYYY HH:mm')}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  {viewMode === 'edit' ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>{intl.formatMessage({ id: 'status' })}</InputLabel>
                      <Select
                        value={selectedOrder.status}
                        onChange={(e) => handleEditStatus(e.target.value)}
                        label={intl.formatMessage({ id: 'status' })}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InfoCircle size={20} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {intl.formatMessage({ id: 'status' })}
                        </Typography>
                        <Box>
                          <Chip
                            label={selectedOrder.status}
                            color={selectedOrder.status === 'Completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Order Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary" mt={2}>
                    {intl.formatMessage({ id: 'order-items' })}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {selectedOrder.details && selectedOrder.details.length > 0 ? (
                  selectedOrder.details.map((detail, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="textSecondary">
                                {intl.formatMessage({ id: 'voucher-group-id' })}
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {detail.voucher_group_id}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="textSecondary">
                                {intl.formatMessage({ id: 'quantity' })}
                              </Typography>
                              <Typography variant="body2" fontWeight="500">
                                {detail.quantity_voucher}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="textSecondary">
                                {intl.formatMessage({ id: 'site-id' })}
                              </Typography>
                              <Typography variant="body2">{detail.site_id}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="textSecondary">
                                {intl.formatMessage({ id: 'region-id' })}
                              </Typography>
                              <Typography variant="body2">{detail.region_id}</Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">{intl.formatMessage({ id: 'no-order-items' })}</Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseModal} color="inherit">
                {intl.formatMessage({ id: 'close' })}
              </Button>
              {viewMode === 'edit' && (
                <Button variant="contained" onClick={handleSaveStatus}>
                  {intl.formatMessage({ id: 'save' })}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VoucherOrderManagement;
