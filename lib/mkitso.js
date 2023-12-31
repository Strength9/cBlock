const fs = require("fs");
const prompts = require('prompts');

const DIR = '.';

const QUESTIONS = [
    {
        type: 'text',
        name: 'basefold',
        message: 'Base Blocks Folder',
        initial: 'blocks'
    },
    {
        type: 'text',
        name: 'basescss',
        message: 'Base SCSS File',
        initial: '_blocks.scss'
    },
    {
        type: 'text',
        name: 'title',
        message: 'Block Name'
    },
    {
        type: 'text',
        name: 'description',
        message: 'Block description',
        initial: ''
    },
    

    {
        type: 'text',
        name: 'category',
        message: 'Block category',
        initial: 'themename'
    },
    {
        type: 'text',
        name: 'icon',
        message: 'Dashicon',
        initial: 'awards'
    }
];


//

const path = require('path');



exports.acfBlock = function() {

    console.clear();
    console.log('Create Block is running...');
    console.log('');
    console.log('This will create a new folder in the current directory containing scaffolding for a new Strength 9 Block.');
    console.log('');

    let cancelled = false;

    // Listen for SIGINT signals and set the "cancelled" flag to true.
    process.on('SIGINT', () => {
        console.log('Cancelled.');
        cancelled = true;
    });

    // Helper function for creating files.
    const createFile = async (path, content, successMessage, errorMessage) => {
        try {
            fs.writeFileSync(path, content);
            console.log(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
        }
    };

    (async () => {
				const response = await prompts(QUESTIONS, {onCancel: () => {cancelled = true}});

				// Check if the user cancelled the prompts.
				if (cancelled) {
					console.log('Aborting...');
					return;
				}

        const title = response.title;
        const slug = response.title.replace(/\s+/g, '-').toLowerCase();
        const qualifiedName = slug;
        const folder = '/' + slug;
        const baseaddress = DIR;
        const basefolder = response.basefold;
        const absolute = baseaddress + '/' + basefolder + folder;
        const includescss = slug + '/' + slug;  
        const masterfile = basefolder+ '/' +response.basescss;     
        
        // Create default CSS class.
        const css = '.' +slug + ' {}';

        
        // Create Folder.
        if (!fs.existsSync(basefolder)) {
            fs.mkdirSync(basefolder);
            console.log('Base Folder Created')
        } else {
            console.log('Base Folder Present')
        }


        // Create Folder.
        if (!fs.existsSync(absolute)) {
            fs.mkdirSync(absolute);
        } else {
            console.log('Error: A directory called ' + slug + ' was already found. Aborting.')
            return;
        }

        // Handle cancellation.
        if (cancelled) {
            console.log('Aborting.');
            return;
        }

        await createFile(
            absolute + '/_' + slug + '.scss',
            `// ${css}`,
            `${slug}.scss created`,
            'Error creating SCSS file:'
        );




        if (!fs.existsSync(masterfile)) {
            
            fs.appendFile(masterfile, '', function (err) {
                if (err) throw err;
                fs.appendFileSync(masterfile, ""); 
                console.log('Master SCSS File is created successfully.');
              });
              fs.appendFileSync(masterfile, "/* Master File */"); 
              fs.appendFileSync(masterfile, "\n @import '"+includescss+"';"); 
                console.log('The Scss file was added to the script!'); 
          } else {

            fs.appendFileSync(masterfile, "\n @import '"+includescss+"';"); 
            console.log('The Scss file was added to the script!'); 

          }


        // Handle cancellation.
        if (cancelled) {
            console.log('Aborting.');
            return;
        }

        // Get the PHP template and turn in to PHP.
        let phpTemplate = '/template-php.txt';
        try {
            let data = fs.readFileSync(__dirname + phpTemplate, 'utf8');
            data = data.replace(/XYZ/g, title)
						.replace(/QWY/g, slug)
						.replace(/\r\n/g, '\n');
				await createFile(
						absolute + '/' + slug + '.php',
						data,
						`${slug}.php created`,
						'Error creating PHP template:'
				);
		} catch (error) {
				console.error('Error creating PHP template:', error);
		}

		// Handle cancellation.
		if (cancelled) {
				console.log('Aborting.');
				return;
		}

		// Get the Block.json template.
		let jsonTemplate = '/template-block.json';
		try {
				let raw = fs.readFileSync(__dirname + jsonTemplate);
				let template = JSON.parse(raw);
				// Update Block.json values.
				template.name = qualifiedName;
				template.title = title;
				template.description = response.description;
                template.category = response.category;
				template.icon = response.icon;
				template.acf.renderTemplate = slug + '.php';
				let jsonContent = JSON.stringify(template, null, "\t");
				await createFile(
						absolute + '/block.json',
						jsonContent,
						'block.json created',
						'Error creating JSON template:'
				);
		} catch (error) {
				console.error('Error creating JSON template:', error);
		}

})();
}
