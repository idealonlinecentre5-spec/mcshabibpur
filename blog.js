import{initializeApp}from"https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import{getFirestore,collection,getDocs,getDoc,addDoc,doc}from"https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
const db=getFirestore(initializeApp({apiKey:"AIzaSyBlz3SJwscg0ebDXiZu3I6fpQC0qdxv0zI",authDomain:"mcs-habibpur.firebaseapp.com",projectId:"mcs-habibpur",storageBucket:"mcs-habibpur.firebasestorage.app",messagingSenderId:"95047938599",appId:"1:95047938599:web:754724808fed90ef2ed402"}));
const $=i=>document.getElementById(i),
e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
set=(i,h)=>{const x=$(i);if(x)x.innerHTML=h},
empty=t=>`<div class="mcs-empty">${t}</div>`,
all=async c=>(await getDocs(collection(db,c))).docs.map(d=>({id:d.id,...d.data()})),
fail=i=>set(i,empty('তথ্য লোড করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।'));

all('notices').then(a=>{
  a.sort((x,y)=>String(y.date).localeCompare(String(x.date)));
  const m=a.filter(x=>x.marquee!==false);
  set('mcsMarquee',m.length?m.map(x=>`<span class="mcs-marquee-item">📢 ${e(x.title)}<span class="mcs-marquee-date">${e(x.date)}</span></span>`).join(''):'<span class="mcs-marquee-item">📢 বর্তমানে কোনো নোটিশ নেই</span>');
  set('mcsNoticeList',a.length?a.map(x=>`<div class="mcs-notice-card"><h3>📢 ${e(x.title)}</h3><div class="mcs-date">📅 ${e(x.date)}</div><div class="mcs-details">${e(x.details)}</div></div>`).join(''):empty('📢 বর্তমানে কোনো নোটিশ প্রকাশিত হয়নি।'));
}).catch(()=>{fail('mcsNoticeList');fail('mcsMarquee')});

all('teachers').then(a=>set('mcsTeachers',a.length?a.map(x=>`<div class="mcs-teacher-card"><div class="mcs-teacher-photo">${x.photo?`<img src="${e(x.photo)}" alt="">`:'👨‍🏫'}</div><h3>${e(x.name)}</h3><p>${e(x.post)}</p><p>${e(x.subject)}</p><p>${e(x.mobile)}</p></div>`).join(''):empty('শিক্ষকের তথ্য পাওয়া যায়নি।'))).catch(()=>fail('mcsTeachers'));

all('subjects').then(a=>set('mcsSubjects',a.length?a.map(x=>`<div class="mcs-subject-card"><h3>📚 ${e(x.name)}</h3><p><strong>শ্রেণি:</strong> ${e(x.cls)}</p><p>${e(x.details)}</p></div>`).join(''):empty('কোনো বিষয় পাওয়া যায়নি।'))).catch(()=>fail('mcsSubjects'));

getDoc(doc(db,'settings','main')).then(r=>{
  if(!r.exists())return;const d=r.data();
  if(d.school_name)document.title=d.school_name;
  [['hero_title','heroTitle'],['hero_text','heroText'],['about_title','aboutTitle'],['about_text','aboutText']].forEach(([k,id])=>{if(d[k]&&$(id))$(id).textContent=d[k]});
}).catch(()=>{});

const sid=$('mcsStudentId');
if(sid)sid.insertAdjacentHTML('afterend','<input id="mcsPin" type="password" inputmode="numeric" placeholder="PIN" style="max-width:110px">');
window.mcsSearchResult=async()=>{
  const id=sid.value.trim(),pin=($('mcsPin').value||'').trim();
  if(!id||!pin)return set('mcsResultArea',empty('Student ID ও PIN লিখুন।'));
  if(id.includes('/')||pin.includes('/'))return set('mcsResultArea',empty('ID বা PIN সঠিক নয়।'));
  set('mcsResultArea','<div class="mcs-loading">ফলাফল খোঁজা হচ্ছে...</div>');
  try{
    const r=await getDoc(doc(db,'results',id+'-'+pin));
    if(!r.exists())return set('mcsResultArea',empty('ID বা PIN মেলেনি। আবার দেখুন।'));
    const d=r.data();
    set('mcsResultArea',`<p><strong>${e(d.name)}</strong> · ${e(d.cls)} · ${e(d.exam)}</p><table class="mcs-result-table"><tr><th>বিষয়</th><th>পূর্ণমান</th><th>প্রাপ্ত নম্বর</th><th>গ্রেড</th></tr>${(d.rows||[]).map(x=>`<tr><td>${e(x.subject)}</td><td>${e(x.full)}</td><td>${e(x.got)}</td><td><strong>${e(x.grade)}</strong></td></tr>`).join('')}</table>`);
  }catch(x){set('mcsResultArea',empty('সংযোগ করা যাচ্ছে না।'))}
};

const f=document.querySelector('#admission form');
if(f){
  ['onsubmit','action','target'].forEach(a=>f.removeAttribute(a));
  f.onsubmit=async ev=>{
    ev.preventDefault();
    const g=n=>(f.elements[n]?.value||'').trim(),b=$('mcsAdmissionButton'),m=$('mcsAdmissionMessage');
    b.disabled=true;b.textContent='⏳ আবেদন পাঠানো হচ্ছে...';m.style.display='block';m.style.background='#fff3cd';m.style.color='#664d03';m.textContent='আপনার আবেদন পাঠানো হচ্ছে...';
    try{
      await addDoc(collection(db,'admissions'),{name:g('নাম'),gender:g('লিঙ্গ'),dob:g('জন্ম তারিখ'),class:g('শ্রেণি'),guardian:g('অভিভাবকের নাম'),mobile:g('অভিভাবকের মোবাইল'),address:g('ঠিকানা'),date:g('ভর্তির তারিখ'),createdAt:Date.now()});
      m.style.background='#d1e7dd';m.style.color='#0f5132';m.textContent='আপনার ভর্তি আবেদন জমা হয়েছে। ধন্যবাদ।';b.textContent='✅ আবেদন পাঠানো হয়েছে';f.reset();
    }catch(x){
      m.style.background='#f8d7da';m.style.color='#842029';m.textContent='আবেদন পাঠানো যায়নি। নাম ও মোবাইল ঠিকমতো দিয়ে আবার চেষ্টা করুন।';b.disabled=false;b.textContent='📝 ভর্তি আবেদন পাঠান';
    }
  };
}
