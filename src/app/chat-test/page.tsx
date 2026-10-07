import ChatWidget from  "@/components/ChatWidget";


export default function ChatTestPage(){
    return(
        <main className = "px-4 py-6 sm:px-20">
            <h1 className="text-2xl font-bold mb-4">Chat Test</h1>
            <ChatWidget/>
       </main>
    );
}