import './App.css';
import { ImAttachment } from "react-icons/im";
import { IoSend, IoClose } from "react-icons/io5";
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [userInput, setUserInput] = useState('');
  const [labtext, setLabtext] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [pdfFileName, setPdfFileName] = useState(null);

  const getAnswer = async (inputData) => {
    try {
      const secondApiUrl = 'http://13.201.134.179:5000/process_pdf';
      const secondApiResponse = await axios.post(secondApiUrl, {
        input_query: labtext,
        user_question: "please analyse this",
      });

      const answerMessage = {
        text: secondApiResponse.data.answer,
        isUser: false,
      };
      setConversation((prevConversation) => [...prevConversation, answerMessage]);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const fetchData = async (inputData) => {
    try {
      const apiUrl = 'http://13.201.134.179:5000/get_answer';
      const response = await axios.post(apiUrl, inputData);

      const newMessage = {
        text: userInput,
        isUser: true,
      };

      const botMessage = {
        text: response.data.answer,
        isUser: false,
      };

      setConversation([...conversation, newMessage, botMessage]);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSend = () => {
    if (userInput.trim() !== '') {
      const userMessage = {
        text: userInput,
        isUser: true,
      };

      setConversation([...conversation, userMessage]);

      const inputData = { input_query: userInput };
      if (isActive) {
        console.log("isActive ", isActive)
        getAnswer(inputData)
      } else {
        console.log("isActive else ", isActive)
        fetchData(inputData);
      }
      setUserInput('');
    }
  }

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];

      if (file && file.type.includes('pdf')) {
        setIsActive(!isActive);
        setPdfFileName(file.name);

        const formData = new FormData();
        formData.append('pdf_file', file);

        const apiUrl = 'http://13.201.134.179:5000/extract_text_from_pdf';
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const extractedText = response.data.text;
        setLabtext(extractedText);

        // const pdfMessage = {
        //   text: `PDF: ${file.name}`,
        //   isUser: true,
        // };
        // setConversation((prevConversation) => [...prevConversation, pdfMessage]);

      } else {
        const errorMessage = {
          text: 'Please upload only PDF files.',
          isUser: false,
        };
        setConversation((prevConversation) => [...prevConversation, errorMessage]);
      }
    } catch (error) {
      console.error('Error handling file change:', error);
    }
  }

  const handleRemovePdf = () => {
    setIsActive(false);
    setPdfFileName(null);
    setLabtext('');
  }

  return (
    <div className='flex flex-col gap-8 mb-10 h-screen'>
      {/* Heading */}
      <div className='text-4xl font-bold text-center mt-12 text-blue-900'>
        <h1>
          Welcome to <span className='text-[#034371]'>AiMl Vaidya</span>
        </h1>
      </div>

      {/* Conversation field */}
      <div className='text-lg font-semibold text-center p-4 rounded-md mx-auto max-w-[800px]' style={{ maxHeight: '100%', overflowY: 'scroll' }}>
        {conversation.map((message, index) => (
          <div key={index} className={`flex flex-row mt-4 justify-start`}>
            <div className={`p-2 rounded-lg shadow-md ${message.isUser ? "bg-slate-200" : "bg-blue-200"}`}>
              <div className={`flex gap-5 justify-center items-center`}>
                <span className={`border-2 rounded-full p-2 bg-white bg-opacity-75`}>{message.isUser ? 'You' : 'Bot'}</span>
                <p className={`${message.isUser ? 'text-stone-950' : 'text-black'} `}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attach PDF */}
      <div className='flex justify-center border-2 max-w-[800px] w-11/12 mx-auto rounded-lg'>
        <div className='flex flex-col w-full'>
          <div className='flex bg-[#F7F7F7] h-[40px] w-full items-center pl-4 gap-2 rounded-t-lg'>
            {pdfFileName ? (
              <>
                <p className="text-sm text-blue-900">{pdfFileName}</p>
                <IoClose className="text-red-500 cursor-pointer ml-2" onClick={handleRemovePdf} />
              </>
            ) : (
              <label htmlFor='fileInput' className='flex justify-center items-center gap-3 cursor-pointer'>
                <ImAttachment className="text-blue-500" />
                <p className="text-sm text-blue-900">Attach pdf</p>
              </label>
            )}
            <input
              id='fileInput'
              type='file'
              accept='.pdf'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Input field */}
          <div className='flex flex-row justify-between bg-white rounded-b-lg'>
            <input
              type='text'
              placeholder='Medical problems only...'
              className='outline-none flex-grow py-3 px-4 rounded-l-lg text-blue-900'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            {/* send button */}
            <div className='flex items-center pr-3'>
              <IoSend onClick={handleSend} className="cursor-pointer h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
