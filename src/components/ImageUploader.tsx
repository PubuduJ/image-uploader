import ImgCrop from "antd-img-crop";
import {Modal, Upload, UploadFile, UploadProps} from "antd";
import {useCallback, useState} from "react";
import Toast, {ToastData} from "./Toast";
import {RcFile} from "antd/es/upload";
import {Box, Typography} from "@mui/material";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import "./ImageUploader.css";

// Base64 image conversion logic.
const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const ImageUploader = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [previewTitle, setPreviewTitle] = useState<string>("");
    const [toastConfig, setToastConfig] = useState<ToastData>({open: false, message: "", type: "error"});

    const beforeImageUpload = async (file: RcFile) => {
        const isJpgOrPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPngOrJpeg) {
            setToastConfig({
                open: true,
                message: "You can only upload JPG/JPEG/PNG file!",
                type: "error"
            });
            return Upload.LIST_IGNORE;
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
            setToastConfig({
                open: true,
                message: "Cropped image must be smaller than 1MB!",
                type: "error"
            });
            return Upload.LIST_IGNORE;
        }
        const base64String = await getBase64(file as RcFile);
        console.log(base64String);
        return true;
    };

    const onImageContainerChange: UploadProps['onChange'] = async ({fileList: newFileList}) => {
        setFileList(newFileList);
    };

    const onImagePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj as RcFile);
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleImageToastOnclose = useCallback((state: boolean) => {
        setToastConfig((prevState: ToastData) => {return {...prevState, "open" : state}})
    }, [])

    return (
        <>
            <Box
                className={"outer-box"}
                sx={{
                    width: "200px",
                    height: "200px",
                    border: "1px solid darkgray",
                    borderRadius: "8px",
                }}
                position={"relative"}
            >
                <Box
                    position={"absolute"}
                    zIndex={-1}
                    sx={{
                        backgroundColor: "gray"
                    }}
                >
                    <Box
                        // Inner content
                        id={"image-box"}
                        sx={{
                            width: "200px",
                            height: "200px",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            alignItems: "center",
                            alignContent: "space-evenly",
                        }}
                    >
                        <>
                            <FileUploadRoundedIcon/>
                            <Box
                                display={"flex"}
                                flexWrap={"wrap"}
                                justifyContent={"center"}
                            >
                                <Typography>Drag and drop here or</Typography>
                                <Typography>Upload Profile Image</Typography>
                            </Box>
                        </>
                    </Box>
                </Box>
                <ImgCrop
                    showGrid
                    showReset
                    zoomSlider
                >
                    <Upload
                        action=""
                        listType="picture-card"
                        accept=".jpeg,.png,.jpg"
                        fileList={fileList}
                        multiple={false}
                        beforeUpload={beforeImageUpload}
                        onChange={onImageContainerChange}
                        onPreview={onImagePreview}
                    >
                        {(fileList.length < 1) && " "}
                    </Upload>
                </ImgCrop>
            </Box>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>
            <Toast
                data={toastConfig}
                action={{
                    onClose: handleImageToastOnclose
                }}
            />
        </>
    )
}

export default ImageUploader;