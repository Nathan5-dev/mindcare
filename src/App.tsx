import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Users, 
  Home, 
  Heart, 
  Send, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';
import { Page, Message, Psychologist } from './types';
import { PSYCHOLOGISTS, QUICK_QUESTIONS } from './constants';
import { getChatResponse } from './services/geminiService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am MindCare AI. How are you feeling today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }]
    }));

    const response = await getChatResponse(content, history);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || 'I am here to listen.',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setCurrentPage('home');
    }, 3000);
  };

  const NavLink = ({ page, label, icon: Icon }: { page: Page, label: string, icon: any }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setIsMenuOpen(false);
      }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
        currentPage === page 
          ? "bg-brand-600 text-white shadow-lg" 
          : "text-slate-600 hover:bg-brand-100"
      )}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setCurrentPage('home')}
        >
          <div className="bg-brand-600 p-2 rounded-xl">
            <Heart className="text-white" size={24} fill="white" />
          </div>
          <span className="text-2xl font-bold text-brand-700">MindCare AI</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink page="home" label="Home" icon={Home} />
          <NavLink page="chat" label="Chat" icon={MessageSquare} />
          <NavLink page="psychologists" label="Psychologists" icon={Users} />
          <NavLink page="request-help" label="Request Help" icon={AlertCircle} />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-4"
          >
            <NavLink page="home" label="Home" icon={Home} />
            <NavLink page="chat" label="Chat" icon={MessageSquare} />
            <NavLink page="psychologists" label="Psychologists" icon={Users} />
            <NavLink page="request-help" label="Request Help" icon={AlertCircle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-12 py-12"
            >
              <div className="max-w-3xl flex flex-col gap-6">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Your safe space for <span className="text-brand-600">mental well-being</span>
                </motion.h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  MindCare AI combines advanced artificial intelligence with a network of licensed professionals 
                  to provide you with the support you deserve, whenever you need it.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  <button 
                    onClick={() => setCurrentPage('chat')}
                    className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-brand-700 transition-all flex items-center gap-2"
                  >
                    Start Chat <MessageSquare size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage('psychologists')}
                    className="bg-white text-brand-700 border-2 border-brand-100 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-brand-50 transition-all flex items-center gap-2"
                  >
                    Find a Psychologist <Users size={20} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 w-full">
                {[
                  { title: "AI Support", desc: "24/7 empathetic listening and coping strategies.", icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
                  { title: "Expert Care", desc: "Connect with licensed psychologists for deep support.", icon: Users, color: "bg-green-100 text-green-600" },
                  { title: "Private & Secure", desc: "Your data and conversations are always protected.", icon: Heart, color: "bg-rose-100 text-rose-600" }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 flex flex-col items-center gap-4"
                  >
                    <div className={cn("p-4 rounded-2xl", feature.color)}>
                      <feature.icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-slate-500">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[calc(100vh-12rem)] flex flex-col max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Chat Header */}
              <div className="bg-brand-50 p-4 border-bottom border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-600 p-2 rounded-lg">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">MindCare AI Assistant</h2>
                    <p className="text-xs text-brand-600 font-medium">Always here to listen</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-tight">
                    This AI provides general mental health guidance and does not replace a licensed professional. 
                    If you are in immediate danger, please call emergency services.
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                    <MessageSquare size={48} strokeWidth={1} />
                    <p>No messages yet. Start a conversation.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-brand-600 text-white self-end rounded-tr-none" 
                        : "bg-slate-100 text-slate-800 self-start rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-slate-100 text-slate-800 self-start p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">MindCare is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Questions */}
              <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors border border-brand-100"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                className="p-4 border-t border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          )}

          {currentPage === 'psychologists' && (
            <motion.div
              key="psychologists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900">Our Psychologists</h2>
                <p className="text-slate-500">Connect with licensed professionals who care about your journey.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PSYCHOLOGISTS.map((psy) => (
                  <motion.div
                    key={psy.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4"
                  >
                    <img 
                      src={psy.imageUrl} 
                      alt={psy.name} 
                      className="w-24 h-24 rounded-2xl object-cover shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{psy.name}</h3>
                      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{psy.specialty}</p>
                    </div>
                    <p className="text-sm text-slate-500 flex-1">{psy.description}</p>
                    <button 
                      onClick={() => {
                        setSelectedPsychologist(psy);
                        setCurrentPage('request-help');
                      }}
                      className="w-full py-3 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      Request Consultation <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'request-help' && (
            <motion.div
              key="request-help"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
            >
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
                  <div className="bg-calm-100 p-6 rounded-full">
                    <CheckCircle2 size={64} className="text-calm-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-slate-900">Request Sent!</h2>
                    <p className="text-slate-500">
                      Thank you for reaching out. A member of our team or your selected psychologist 
                      will contact you within 24 hours.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentPage('home')}
                    className="mt-4 text-brand-600 font-bold hover:underline"
                  >
                    Back to Home
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-slate-900">Request a Consultation</h2>
                    <p className="text-slate-500">Fill out the form below and we'll help you get started.</p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="John Doe"
                          className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="john@example.com"
                          className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Preferred Psychologist</label>
                      <select 
                        className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none"
                        defaultValue={selectedPsychologist?.id || ""}
                        onChange={(e) => {
                          const psy = PSYCHOLOGISTS.find(p => p.id === e.target.value);
                          setSelectedPsychologist(psy || null);
                        }}
                      >
                        <option value="">Any available professional</option>
                        {PSYCHOLOGISTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">How can we help you?</label>
                      <textarea 
                        required
                        rows={4}
                        placeholder="Briefly describe what you're going through..."
                        className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                    >
                      Submit Request <Send size={20} />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Heart className="text-brand-600" size={20} fill="currentColor" />
              <span className="text-xl font-bold text-brand-700">MindCare AI</span>
            </div>
            <p className="text-sm text-slate-500">
              Providing accessible mental health support through technology and human connection.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="text-sm text-slate-500 flex flex-col gap-2">
              <li className="hover:text-brand-600 cursor-pointer" onClick={() => setCurrentPage('home')}>Home</li>
              <li className="hover:text-brand-600 cursor-pointer" onClick={() => setCurrentPage('chat')}>AI Chat</li>
              <li className="hover:text-brand-600 cursor-pointer" onClick={() => setCurrentPage('psychologists')}>Psychologists</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="text-sm text-slate-500 flex flex-col gap-2">
              <li className="hover:text-brand-600 cursor-pointer">Crisis Resources</li>
              <li className="hover:text-brand-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-brand-600 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Emergency</h4>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
              <p className="text-xs text-rose-800 font-medium">
                If you are in a crisis, please call 988 (in the US) or your local emergency number immediately.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} MindCare AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
