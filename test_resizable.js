try {
    const pkg = require('react-resizable-panels');
    console.log('Exports:', Object.keys(pkg));
    console.log('Sample export:', pkg);
} catch (e) {
    console.error('Error:', e.message);
}
