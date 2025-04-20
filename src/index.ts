import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import {env} from 'hono/adapter'
import { signupMIddleware } from './middlewares/signup_validator';
import { signinMIddleware } from './middlewares/signin_validator';
import { authtoken } from './middlewares/authorizetoken';
import { decode, sign, verify } from 'hono/jwt'
import { cors } from 'hono/cors';
import z from 'zod'
//import { FetchEvent, Response, ScheduledEvent } from '@cloudflare/workers-types';

//import { notesauth } from './middlewares/notesauth';


const app = new Hono();
app.use(cors());

async function jwtsign(username:string):Promise<string>{
  const payload = {
    username:username
  }
  const secret = 'mySecretKey'
  const token = await sign(payload, secret)
  return token;
}




// app.get('/test-schedule', async(c) => {
//   await handleScheduled({} as ScheduledEvent); // Mock the ScheduledEvent
//   return c.text('Scheduled task executed');
// });

// addEventListener('fetch', (event: FetchEvent) => {
//   // @ts-ignore
//   event.respondWith(app.fetch(event.request));
// });

// addEventListener('scheduled', (event: ScheduledEvent) => {
//   event.waitUntil(handleScheduled(event));
// });









app.post('/varification', async (c) => {
  const body = await c.req.json();
  //console.log(body);
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  const emailSchema = z.object({
    email: z.string().email(),
  });

  function generateVerificationCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  try {
    const validation = emailSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: 'Invalid email format',success:false }, 400);
    }
    const code = generateVerificationCode();
    const email = body.email.trim();
    //const trimmedStr = str.trim();
    const resp = {
      email,
      code
    }
    
    const response2 = await fetch('https://mailexpress.vercel.app/sendcode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(resp), // Send data1 as JSON body
          });
    const result = await response2.json();
    try {
      const res = await prisma.emailwithcode.upsert({
        where: { email: email }, // Check if email already exists
        update: { code: code }, // If exists, update the code
        create: { email: email, code: code }, // If doesn't exist, create a new record
        select: { id: true },
      });
      
      return c.json({
        res: res,
        success:true
      });
    } catch (error) {
      console.error('Error creating/updating record:', error);
      return c.json({message:'Internal Server Error',success:true}, 500);
    } finally {
      prisma.$disconnect();
    }
    //console.log(result);

  } catch (error) {
    console.error('Error in verifying', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});




app.post('/varifycode', async (c) => {
  const body = await c.req.json();
  //console.log(body);
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c);

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const code = body.code;
    const email = body.email.trim();
    try {
      const res = await prisma.emailwithcode.findUnique({
        where: { email: email }, // Check if email already exists
        select: { id: true, code:true},
      });

      if(res && res.code===code){
        return c.json({
          success:true
        });
      }else{
        return c.json({
          success:false
        });
      }
      
      
    } catch (error) {
      console.error('Error creating/updating record:', error);
      return c.json({message:'Internal Server Error',success:false}, 500);
    } finally {
      prisma.$disconnect();
    }
    //console.log(result);

  } catch (error) {
    console.error('Error in verifying', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});




app.post('/', async (c) => {
  return c.json({
    message:"hi"
  })
})




app.post('/signup',signupMIddleware, async (c) => {
  const b = await c.req.json();
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const res = await prisma.user.create({
      data:{
        name: b.name,
        username: b.username,
        password:b.password,
        private: false,
        notifications:0,
      },
      select:{
        id:true,
      }
    });
    const token = await jwtsign(b.username);
    return c.json({
      res: res,
      token:token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});


app.post('/signin',signinMIddleware, async (c:any) => {
  
  const b = await c.req.json();
  const token = await jwtsign(b.username);
  const allData = c.get("alluserinfo");
  

  return c.json({
    token:token,
    data:allData
  })  
});



app.post('/savetabs',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const createdTabs = await prisma.tab.createMany({
      data: b.tabs.map((tabData:any) => ({
        user_id: id,
        title: tabData.title,
        url: tabData.url,
        folder_id: 2,
        favIconUrl: tabData.favIconUrl,
        tabid: tabData.tabid,
        type: tabData.type,
        date: tabData.date
      })),
    });
    //console.log(createdTabs);
    return c.json({
      success:true,
      message: 'Tabs saved successfully',
    })
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});






app.post('/getlatesttabs',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
        const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
      const prisma = new PrismaClient({
        datasourceUrl: DATABASE_URL,
      }).$extends(withAccelerate());
      const latestRecord = await prisma.tab.findFirst({
        where: {
          user_id: id,
        },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          created_at: true,
        },
      });

      if (!latestRecord) {
        console.log("No records found.");
        return [];
      }

      const latestDate = latestRecord.created_at;
      const startOfDay = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate()); 
      const endOfDay = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate(), 23, 59, 59, 999);
      const recordsFromLatestDate = await prisma.tab.findMany({
        where: {
          user_id: id,
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select:{
          id:true,
          title:true,
          url:true,
          date:true,
          created_at:true
        }
      });
        //console.log(createdTabs);
        return c.json({
          success:true,
          tabs:recordsFromLatestDate
        })
      } catch (error) {
        console.error('Error creating user:', error);
        return c.json({
          success:false,
          message: 'error',
        })
      }finally{
        prisma.$disconnect();
      }
});


app.post('/savemantabs',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const createdTabsfolder = await prisma.manFolder.create({
      data: {
        user_id:id,
        title:b.title,
        default:false,
      },
      select:{
        id:true,
      }
    });
    //console.log(createdTabsfolder);
    const folder_id = createdTabsfolder.id;

    const createdTabs = await prisma.manTab.createMany({
      data: b.tabs.map((tabData:any) => ({
        user_id: id,
        title: tabData.title,
        url: tabData.url,
        folder_id: folder_id,
        favIconUrl: tabData.favIconUrl,
        tabid: tabData.tabid,
        type: tabData.type,
        date: tabData.date
      })),
    });
    //console.log(createdTabs);
    return c.json({
      success:true,
      message: 'Tabs saved successfully',
    })
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});







app.post('/addmantabs',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const createdTabs = await prisma.manTab.createMany({
      data: b.tabs.map((tabData:any) => ({
        user_id: id,
        title: tabData.title,
        url: tabData.url,
        folder_id: b.currentfolder,
        favIconUrl: tabData.favIconUrl,
        tabid: tabData.tabid,
        type: tabData.type,
        date: tabData.date
      })),
    });
    //console.log(createdTabs);
    return c.json({
      success:true,
      message: 'Tabs saved successfully',
    })
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});




app.post('/getmanfolders',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const folders = await prisma.manFolder.findMany({
      where:{
        user_id:id
      },
      select:{
        id:true,
        title:true,
        created_at:true
      }
    });
    //console.log(createdTabs);
    return c.json({
      success:true,
      folders:folders
    })
  } catch (error) {
    console.error('Error fetching folders:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});



app.post('/getmantabs',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const folders = await prisma.manTab.findMany({
      where:{
        folder_id:b.folder_id
      },
      select:{
        id:true,
        tabid:true,
        title:true,
        created_at:true,
        url:true,
        favIconUrl:true
      }
    });
    //console.log(createdTabs);
    return c.json({
      success:true,
      tabs:folders
    })
  } catch (error) {
    console.error('Error fetching folders:', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});


app.post('/getrecenthistory',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)

  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const recentTabs = await prisma.tab.findMany({
      where: {
        user_id: id, // Replace `someUserId` with the desired user's ID
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 25,
      select:{
        id:true,
        title:true,
        url:true,
        favIconUrl:true,
      }
    });
    
        //console.log(createdTabs);
        return c.json({
          success:true,
          tabs:recentTabs
        })
      } catch (error) {
        console.error('Error fetching tabs', error);
        return c.json({
          success:false,
          message: 'error',
        })
      }finally{
        prisma.$disconnect();
      }
});




app.post('/deletetab',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const result = await prisma.tab.delete({
      where: {
        id: b.id,
      },
    });
    //console.log(createdTabsfolder);
    
    //console.log(createdTabs);
    return c.json({
      success:true,
    })
  } catch (error) {
    console.error('Error deleting tab', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});


app.post('/deletemantab',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const result = await prisma.manTab.delete({
      where: {
        id: b.id,
      },
    });
    //console.log(createdTabsfolder);
    
    //console.log(createdTabs);
    return c.json({
      success:true,
    })
  } catch (error) {
    console.error('Error deleting tab', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});




app.post('/deletehistory',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const result = await prisma.tab.deleteMany({
      where: {
        user_id: id,
      },
    });
    //console.log(createdTabsfolder);
    
    //console.log(createdTabs);
    return c.json({
      success:true,
    })
  } catch (error) {
    console.error('Error deleting history', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});



app.post('/deletefolder',authtoken, async (c:any) => {
  const b = await c.req.json();
  const x = await c.get('userinfo');
  const id = x.id;
  const { DATABASE_URL } = env<{ DATABASE_URL:string }>(c)
  //console.log(b);
  const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const result = await prisma.manFolder.delete({
      where: {
        id: b.folder_id,
      },
    });
    //console.log(createdTabsfolder);
    
    //console.log(createdTabs);
    return c.json({
      success:true,
    })
  } catch (error) {
    //console.error('Error deleting history', error);
    return c.json({
      success:false,
      message: 'error',
    })
  }finally{
    prisma.$disconnect();
  }
});







export default app;




