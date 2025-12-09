// PermissionCheckGroup.tsx
import { Stack, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';
import { FormikProps } from 'formik';
import { OptionList } from 'types';
import { useEffect, useMemo, useCallback } from 'react';

interface PermissionItem {
  id: number;
  isRead: boolean;
  isWrite: boolean;
}

interface Props<FormValues> {
  field: keyof FormValues;
  formik: FormikProps<FormValues>;
  inputLabel: string;
  arrayOption: OptionList[];
}

export function PermissionCheckGroup<FormValues>({ field, formik, inputLabel, arrayOption }: Props<FormValues>) {
  const accessMap = useMemo(() => {
    const m = new Map<number, PermissionItem>();
    const arr = (formik.values[field] as PermissionItem[]) ?? [];
    arr.forEach((p) => m.set(p.id, p));
    return m;
  }, [formik.values, field]);

  useEffect(() => {
    const validIds = new Set(arrayOption.map((o) => Number(o.value)));
    const currentArr = (formik.values[field] as PermissionItem[]) ?? [];

    // Lọc chỉ giữ lại những item có ít nhất một quyền true và có trong arrayOption
    const filteredArr = currentArr.filter((perm) => validIds.has(perm.id) && (perm.isRead || perm.isWrite));

    // Chỉ cập nhật nếu có thay đổi
    if (filteredArr.length !== currentArr.length || !currentArr.every((item) => validIds.has(item.id))) {
      formik.setFieldValue(field as string, filteredArr);
    }
  }, [arrayOption, formik.values, field, formik]);

  const updatePermission = useCallback(
    (id: number, partial: Partial<Omit<PermissionItem, 'id'>>) => {
      const current: PermissionItem = accessMap.get(id) ?? {
        id,
        isRead: false,
        isWrite: false
      };

      const next: PermissionItem = { ...current, ...partial };

      // Ràng buộc: bật write ⇒ bật read ; tắt read ⇒ tắt write
      if (partial.isWrite) next.isRead = true;
      if (partial.isRead === false) next.isWrite = false;

      // Tạo mảng mới, tránh mutate
      const newArr = [...accessMap.values()].filter((p) => p.id !== id);

      // Chỉ thêm vào mảng nếu có ít nhất một quyền được bật
      if (next.isRead || next.isWrite) {
        newArr.push(next);
      }

      formik.setFieldValue(field as string, newArr);
    },
    [accessMap, formik, field]
  );

  return (
    <Grid item xs={12}>
      <Typography sx={{ marginBottom: '10px' }}>{inputLabel}</Typography>

      <Grid container rowSpacing={1} className="max-h-[45vh] overflow-y-auto">
        {arrayOption.map(({ label, value }) => {
          const id = Number(value);
          const perm = accessMap.get(id);

          const checkedRead = Boolean(perm?.isRead);
          const checkedWrite = Boolean(perm?.isWrite);
          const checkedNone = !checkedRead && !checkedWrite;

          return (
            <Grid key={id} item xs={12}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2
                }}
              >
                <Typography>{label}</Typography>

                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    label="Không"
                    control={<Checkbox checked={checkedNone} onChange={() => updatePermission(id, { isRead: false, isWrite: false })} />}
                  />

                  <FormControlLabel
                    label="Xem"
                    control={<Checkbox checked={checkedRead} onChange={(e) => updatePermission(id, { isRead: e.target.checked })} />}
                  />

                  <FormControlLabel
                    label="Chỉnh sửa"
                    control={<Checkbox checked={checkedWrite} onChange={(e) => updatePermission(id, { isWrite: e.target.checked })} />}
                  />
                </Stack>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}
