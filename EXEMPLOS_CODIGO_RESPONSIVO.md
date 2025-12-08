# 💻 Exemplos de Código Responsivo

Guia prático com snippets prontos para usar em novos componentes.

---

## 🎯 Menu Hamburguer Animado

### Ícone de 3 Linhas com Animação
```tsx
<button
  onClick={() => setIsOpen(!isOpen)}
  className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
  type="button"
>
  <motion.span 
    animate={{ 
      rotate: isOpen ? 45 : 0,
      y: isOpen ? 8 : 0
    }}
    className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
  />
  <motion.span 
    animate={{ 
      opacity: isOpen ? 0 : 1,
      x: isOpen ? -10 : 0
    }}
    className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
  />
  <motion.span 
    animate={{ 
      rotate: isOpen ? -45 : 0,
      y: isOpen ? -8 : 0
    }}
    className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full"
  />
</button>
```

---

## 📱 Drawer Mobile com Overlay

### Drawer Lateral
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto"
      >
        {/* Conteúdo do menu */}
        <div className="p-6">
          <h2 className="text-2xl mb-6">Menu</h2>
          {/* Items aqui */}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

---

## 🎨 Glassmorphism

### Card com Efeito Vidro
```tsx
<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl">
  <div className="p-6">
    {/* Conteúdo */}
  </div>
</div>
```

### Sidebar com Blur
```tsx
<div className="relative">
  {/* Fundo blur */}
  <div className="absolute inset-0 -m-4 bg-gradient-to-br from-pink-50/15 via-purple-50/10 to-pink-50/15 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-gray-800/50 backdrop-blur-md rounded-2xl" />
  
  {/* Conteúdo */}
  <div className="relative p-4">
    {/* Items */}
  </div>
</div>
```

---

## 📐 Classes Responsivas Comuns

### Padding Responsivo
```tsx
// Mobile → Tablet → Desktop
className="px-3 sm:px-4 md:px-6 lg:px-8"
className="py-2 sm:py-3 md:py-4 lg:py-6"
```

### Tamanhos de Texto
```tsx
// Título principal
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"

// Subtítulo
className="text-lg sm:text-xl md:text-2xl"

// Body
className="text-sm sm:text-base md:text-lg"

// Small
className="text-xs sm:text-sm"

// Tiny
className="text-[10px] sm:text-xs"
```

### Gaps e Espaçamentos
```tsx
// Entre elementos
className="gap-2 sm:gap-3 md:gap-4 lg:gap-6"

// Entre linhas
className="space-y-2 sm:space-y-3 md:space-y-4"

// Entre colunas
className="space-x-2 sm:space-x-3 md:space-x-4"
```

---

## 🎯 Botões e Controles

### Botão Responsivo
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full bg-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
>
  Clique Aqui
</motion.button>
```

### Toggle Switch Responsivo
```tsx
<button
  onClick={() => setEnabled(!enabled)}
  className={`relative w-9 sm:w-10 h-5 rounded-full transition-colors ${
    enabled ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
  }`}
>
  <div
    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
      enabled ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
    }`}
  />
</button>
```

### Input Responsivo
```tsx
<div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 hover:border-pink-300 transition-all min-h-[48px] sm:min-h-[56px] md:min-h-[64px]">
  <textarea
    className="w-full bg-transparent py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-7 text-sm sm:text-base focus:outline-none"
    placeholder="Digite aqui..."
    rows={1}
  />
  <button className="absolute right-2 bottom-2 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-pink-500 flex items-center justify-center">
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" /* ... */ />
  </button>
</div>
```

---

## 🎴 Grids Responsivos

### Grid Automático
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Flex Responsivo
```tsx
<div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center">
  <div className="flex-1">
    {/* Conteúdo esquerdo */}
  </div>
  <div className="flex-1">
    {/* Conteúdo direito */}
  </div>
</div>
```

---

## 💬 Mensagens de Chat

### Mensagem Responsiva
```tsx
<div className={`flex items-start gap-2 sm:gap-3 ${
  isUser ? 'flex-row-reverse' : 'flex-row'
}`}>
  {/* Avatar */}
  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-pink-400 to-pink-600" />
  
  {/* Mensagem */}
  <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 sm:p-4 shadow-sm">
      <p className="text-sm sm:text-base">{message}</p>
    </div>
  </div>
</div>
```

---

## 📊 Cards de Estatísticas

### Card Stat Responsivo
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6">
  <div className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-1">
    {value}
  </div>
  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-light">
    {label}
  </div>
</div>
```

---

## 🎭 Modais Responsivos

### Modal Centralizado
```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-xl sm:text-2xl font-light mb-4">Título</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          Conteúdo do modal
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 py-3 border rounded-lg">Cancelar</button>
          <button className="flex-1 py-3 bg-pink-500 text-white rounded-lg">Confirmar</button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

---

## 🌐 Container Principal

### Container Responsivo Padrão
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  {/* Header fixo */}
  <div className="fixed top-6 sm:top-8 left-16 md:left-6 lg:left-8 z-50">
    <h1 className="text-base sm:text-xl md:text-2xl">Logo</h1>
  </div>

  {/* Conteúdo central */}
  <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 py-20 md:py-24">
    <div className="max-w-4xl w-full">
      {/* Conteúdo */}
    </div>
  </div>
</div>
```

---

## 🎨 SVG Responsivo

### SVG com viewBox
```tsx
<svg 
  width="100%" 
  height="auto" 
  viewBox="0 0 300 300" 
  className="overflow-visible max-w-sm"
  preserveAspectRatio="xMidYMid meet"
>
  {/* Elementos SVG */}
</svg>
```

---

## 🔄 Animações Comuns

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {/* Conteúdo */}
</motion.div>
```

### Slide In
```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3, delay: 0.1 }}
>
  {/* Conteúdo */}
</motion.div>
```

### Scale & Hover
```tsx
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Botão Animado
</motion.button>
```

### Loading Spinner
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
  className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full"
/>
```

---

## 🎯 Posicionamento Responsivo

### Fixed com Ajuste Mobile
```tsx
// Logo evitando hamburger
className="fixed top-6 left-16 md:left-6 z-50"

// Controles canto direito
className="fixed top-6 right-4 sm:right-6 z-50"

// Sidebar desktop only
className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2"

// Menu mobile only
className="md:hidden fixed top-6 left-4"
```

---

## 📋 Badge/Tag Responsivo

### Badge Pequeno
```tsx
<span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-[10px] sm:text-xs font-light">
  <span className="text-xs sm:text-sm">{emoji}</span>
  <span>{label}</span>
</span>
```

---

## 🎨 Theme Toggle (Dark Mode)

### Toggle Responsivo
```tsx
<button
  onClick={toggleTheme}
  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:scale-105 transition-all"
>
  {isDark ? (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" /* Sol */ />
  ) : (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" /* Lua */ />
  )}
</button>
```

---

## 💡 Dicas Importantes

### 1. Mobile-First
Sempre comece com classes base (mobile) e adicione breakpoints:
```tsx
// ❌ Errado
className="lg:text-base text-xs"

// ✅ Correto
className="text-xs lg:text-base"
```

### 2. Touch Targets
Botões mínimo 44x44px em mobile:
```tsx
className="min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px]"
```

### 3. Evite Overlap
Logo + Menu hamburguer:
```tsx
// Logo com espaço para hamburger
className="left-16 md:left-6"

// Hamburger
className="left-4"
```

### 4. Teste Real
```bash
# Abra DevTools
Ctrl + Shift + M (Windows/Linux)
Cmd + Shift + M (Mac)

# Teste dispositivos:
- iPhone SE (375px)
- iPhone 12 (390px)
- iPad (768px)
- Desktop (1280px+)
```

---

## 🚀 Performance

### Lazy Loading
```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Carregando...</div>,
  ssr: false
})
```

### Imagens Responsivas
```tsx
<img
  src={image}
  srcSet={`${imageSmall} 640w, ${imageMedium} 1024w, ${imageLarge} 1920w`}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Descrição"
  loading="lazy"
/>
```

---

**Use estes exemplos como base para criar novos componentes responsivos!** 🎉

