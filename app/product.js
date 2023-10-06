'use client'

// import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useMemo, useState, useRef} from 'react';

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill");
        return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
    },
    {
        ssr: false,
    }
)

function Product() {
    const [value, setValue] = useState(''); // 에디터 속 콘텐츠를 저장하는 state
    const [title, setTitle] = useState('')

    // const quillRef = React.forwardRef();
    let reactQuillRef = useRef(null);

    const getTempProductID = async () => {
        const response = await fetch("http://127.0.0.1:8000/api/product/newtemp/");

        if (response.ok) {
            const ret = await response.json();
            return ret;
        }
        return -1;
    };
    let id = -1;
    getTempProductID().then(function(resolvedData) {
        id = resolvedData; // 100
    });
    
    // getTempProductID();
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
    
        input.addEventListener('change', async () => {     
            console.log(reactQuillRef.current);       
            const data = new FormData();
            data.append('productID', id);
            data.append('imageFile', input.files[0]);

            const response = await fetch("http://127.0.0.1:8000/api/product/image/upload/",{
                method: "POST",
                body: data
            });

            if (response.ok) {
                const ret = await response.json();
                try {
                    const imgUrl = "http://127.0.0.1:8000"+ret;
                    const editor = reactQuillRef.current.getEditor(); 
                    const range = editor.getSelection();
                    editor.insertEmbed(range.index, 'image', imgUrl);
                    editor.setSelection(range.index + 1);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };
    const modules = useMemo(
        () => ({
        toolbar: {
        container: [
            [{ header: '1' }, { header: '2' }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
            ['image'],
        ],
        handlers: { image: imageHandler },
        },
        clipboard: {
        matchVisual: false,
        },
    }),[],);

    const handleText = (value) => {
        console.log(value);
        // setText(value);
      };
    const handleImageUpload = (e) => {
        [...e.target.files].forEach(async (file) => {
            const data = new FormData();
            data.append('productID', id);
            data.append('upload_images[]',file);

            const response = await fetch("http://127.0.0.1:8000/api/product/slide/upload/",{
                method: "POST",
                body: data
            });
            if (response.ok) {
                const ret = await response.json();
                console.log(ret);
            }    
        });
        // const fileArr = e.target.files;

        // let fileURLs = [];
        
        // let file;
        // let filesLength = fileArr.length > 10 ? 10 : fileArr.length;

        // for (let i = 0; i < filesLength; i++) {
        //     file = fileArr[i];
        
        //     let reader = new FileReader();
        //     reader.onloadend = () => {
        //         console.log(reader.result);
        //         fileURLs[i] = reader.result;
        //         if (fileURLs[i]) {
        //             setPreviewImg([...previewImg, previewImgUrl])
        //         }
        //         // setDetailImgs([...fileURLs]);
        //     };
        //     // reader.readAsDataURL(file);
        // }

    };

    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'align',
        'image',
    ];
    return (
        <div>
        <input type="text" placeholder="제목" className="form-control" onChange={(event) => setTitle(event.target.value)} />
        <input
            type="file"
            multiple
            accept="image/jpg,image/png,image/jpeg,image/gif"
            onChange={handleImageUpload}/>
        <ReactQuill
            forwardedRef={reactQuillRef}
            onChange={handleText}
            modules={modules}
            formats={formats}
            value={setValue}
            theme="snow"
        />
        <button>글쓰기</button>
        <button>취소</button>
        </div>
    )
}
export default Product;