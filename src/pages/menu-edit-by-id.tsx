import useSWR from "swr";
import { Menu } from "../lib/models";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout";
import { Alert, Button, Container, Divider, NumberInput, TextInput } from "@mantine/core";
import Loading from "../components/loading";
import { IconAlertTriangleFilled, IconTrash } from "@tabler/icons-react";
import { isNotEmpty, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

export default function MenuEditById() {
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: menu, isLoading, error } = useSWR<Menu>(`/menus/${menuId}`);
  const [isSetInitialValues, setIsSetInitialValues] = useState(false);

  const menuEditForm = useForm({
    initialValues: {
      name: "",
    },

    validate: {
      name: isNotEmpty("กรุณาใส่ชื่อกาแฟ"),
    },
  });

  const handleSubmit = async (values: typeof menuEditForm.values) => {
    try {
      setIsProcessing(true);
      await axios.patch(`/menus/${menuId}`, values);
      notifications.show({
        title: "แก้ไขข้อมูลกาแฟสำเร็จ",
        message: "ข้อมูลกาแฟได้รับการแก้ไขเรียบร้อยแล้ว",
        color: "teal",
      });
      navigate(`/menus/${menuId}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลกาแฟ",
            message: "ไม่พบข้อมูลกาแฟที่ต้องการแก้ไข",
            color: "red",
          });
        } else if (error.response?.status === 422) {
          notifications.show({
            title: "ข้อมูลไม่ถูกต้อง",
            message: "กรุณาตรวจสอบข้อมูลที่กรอกใหม่อีกครั้ง",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await axios.delete(`/menus/${menuId}`);
      notifications.show({
        title: "ลบกาแฟสำเร็จ",
        message: "ลบกาแฟแก้วนี้ออกจากระบบเรียบร้อยแล้ว",
        color: "red",
      });
      navigate("/menus");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          notifications.show({
            title: "ไม่พบข้อมูลกาแฟ",
            message: "ไม่พบข้อมูลกาแฟที่ต้องการลบ",
            color: "red",
          });
        } else if (error.response?.status || 500 >= 500) {
          notifications.show({
            title: "เกิดข้อผิดพลาดบางอย่าง",
            message: "กรุณาลองใหม่อีกครั้ง",
            color: "red",
          });
        }
      } else {
        notifications.show({
          title: "เกิดข้อผิดพลาดบางอย่าง",
          message: "กรุณาลองใหม่อีกครั้ง หรือดูที่ Console สำหรับข้อมูลเพิ่มเติม",
          color: "red",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isSetInitialValues && menu) {
      menuEditForm.setInitialValues(menu);
      menuEditForm.setValues(menu);
      setIsSetInitialValues(true);
    }
  }, [menu, menuEditForm, isSetInitialValues]);

  return (
      <Layout>
        <Container className="mt-8">
          <h1 className="text-xl">แก้ไขข้อมูลกาแฟ</h1>

          {isLoading && !error && <Loading />}
          {error && (
            <Alert
              color="red"
              title="เกิดข้อผิดพลาดในการอ่านข้อมูล"
              icon={<IconAlertTriangleFilled />}
            >
              {error.message}
            </Alert>
          )}

          {!!menu && (
            <>
              <form onSubmit={menuEditForm.onSubmit(handleSubmit)} className="space-y-8">
                <TextInput
                  label="ชื่อกาแฟ"
                  placeholder="ชื่อกาแฟ"
                  {...menuEditForm.getInputProps("name")}
                />

                <TextInput
                  label="รายละเอียดกาแฟ"
                  placeholder="รายละเอียดกาแฟ"
                  {...menuEditForm.getInputProps("detail")}
                />

                <NumberInput
                  label="ราคากาแฟ"
                  placeholder="ราคากาแฟ"
                  {...menuEditForm.getInputProps("price")}
                />

                <Divider />

                <div className="flex justify-between">
                  <Button
                    color="red"
                    leftSection={<IconTrash />}
                    size="xs"
                    onClick={() => {
                      modals.openConfirmModal({
                        title: "คุณต้องการลบกาแฟนี้ใช่หรือไม่",
                        children: (
                          <span className="text-xs">
                            เมื่อคุณดำนเนินการลบกาแฟนี้แล้ว จะไม่สามารถย้อนกลับได้
                          </span>
                        ),
                        labels: { confirm: "ลบ", cancel: "ยกเลิก" },
                        onConfirm: () => {
                          handleDelete();
                        },
                        confirmProps: {
                          color: "red",
                        },
                      });
                    }}
                  >
                    ลบกาแฟนี้
                  </Button>

                  <Button type="submit" loading={isLoading || isProcessing}>
                    บันทึกข้อมูล
                  </Button>
                </div>
              </form>
            </>
          )}
        </Container>
      </Layout>
  );
}
