--PHP-alt-<?php echo("$random_hash\r\n") ?>
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit

<?php
/**
 * Message to broker
 * Email message to broker 
 */
?>

Greeting,
While browsing on your site at <?php echo $_SERVER['HTTP_HOST'] ?>, someone has decided to send you a message.

This is the information sent:
<?php
foreach ($data as $key => $value) {
    echo($key . ': ' . $value . "\r\n");
}
?>

CONTACT THIS PERSON WITHOUT DELAY!

This prospect has been generated by your <?php echo(SI_NAME) ?> service.


--PHP-alt-<?php echo("$random_hash\r\n") ?>
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: 7bit

<html>
    <body>
        <h2>Greeting</h2>

        <p>While browsing on your site at <?php echo $_SERVER['HTTP_HOST'] ?>, someone has decided to send you a message.</p>

        <p>This is the information sent:</p>
        <table cellspacing="0" cellpadding="10" border="0">
            <?php
            foreach ($data as $key => $value) {
                echo('<tr valign="top"><td>' . $key . '</td><td>' . $value . '</td></tr>');
            }
            ?>
        </table>

        <h3>
        CONTACT THIS PERSON WITHOUT DELAY!
        </h3>
        <p>This prospect has been generated by your <?php echo(SI_NAME) ?> service.</p>
    </body>
</html>

--PHP-alt-<?php echo($random_hash) ?>--