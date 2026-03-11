// export default SendMail;
// import { useState } from 'react';

// function SendMail() {
//   const [AdrMail, setMail] = useState('');
//   const [MailContent, setContent] = useState('');
//   const [MailObject, setObject] = useState('');
//   const [error, setError] = useState('');

//   async function HandlerMail(e: any) {
//     e.preventDefault();

//     if (!AdrMail || !MailObject || !MailContent) {
//       setError('Fields should not be empty');
//       return;
//     }

//     const response = await fetch(`http://localhost:3000/api/sendMail`,{
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         email: AdrMail,
//         object: MailObject,
//         message: MailContent
//       })
//     });

//     const data = await response.json();
//     console.log(data);
//   }


//  return (
//     <div>
//       <h1>Send Mail</h1>
//       <form onSubmit={HandlerMail}>
//         <div>
//           <label htmlFor="email">
//             Email address
//             <input
//               id="email"
//               type="text"
//               autoComplete="on"
//               value={AdrMail}
//               onChange={(e) => setMail(e.target.value)}
//             ></input>
//           </label>
//         </div>
//         <div>
//           <label htmlFor="Object">
//             Object
//             <input
//               id="Object"
//               type="Object"
//               autoComplete="on"
//               value={MailObject}
//               onChange={(e) => setObject(e.target.value)}
//             ></input>
//           </label>
//         </div>
//         <div>
//           <label htmlFor="Content">
//             Content
//             <input
//               id="Content"
//               type="Content"
//               autoComplete="on"
//               value={MailContent}
//               onChange={(e) => setContent(e.target.value)}
//             ></input>
//           </label>
//         </div>
//         <button type="submit">Send Mail</button>
//       </form>
//       {error && <div>{error}</div>}
//     </div>
//   );
// }