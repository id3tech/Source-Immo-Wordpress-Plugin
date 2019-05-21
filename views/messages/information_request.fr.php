--PHP-alt-<?php echo("$random_hash\r\n") ?>
Content-Type: text/plain; charset="utf-8"
Content-Transfer-Encoding: 7bit

<?php
/**
 * Request information message
 * Email to broker when a browsing user request for more information about a listing property
 */
?>

Bonjour,
Alors qu'il navigait sur votre site au <?php echo $_SERVER['HTTP_HOST'] ?>, la propriété situé au
<?php echo $metadata->address?> (<?php echo $metadata->ref_number ?>) a capté l'attention d'un visiteur.

Voici l'information envoyée:
<?php
foreach ($data as $item) {
    echo($item['label'] . ': ' . $item['value'] . "\r\n");
}
?>
Vous êtes à un pas de clore cette vente.
CONTACTEZ CETTE PERSONNE SANS TARDER!

Ce prospect a été généré par votre service <?php echo(SI_NAME) ?>.


--PHP-alt-<?php echo("$random_hash\r\n") ?>
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: 7bit

<html>
    <body style="text-align:center;background-color:#fcfcfc;">
        <table cellpadding="20" cellspacing="0" border="0" style="width:600px;">
            <tr>
                <td style="border:solid 1px #ccc;background-color:#fff;">
                    <h2>Bonjour,</h2>

                    <p>Alors qu'il navigait sur votre <a href="//<?php echo $_SERVER['HTTP_HOST'] ?>" target="_blank">site</a>, la propriété situé au 
                    <strong><?php echo $metadata->address?> <em>(<?php echo $metadata->ref_number ?>)</em></strong> a capté l'attention d'un visiteur.</p>
                    
                    <table cellspacing="0" cellpadding="10" border="0">
                        <thead>
                            <tr><td style="border-bottom:solid 1px #ccc;">&nbsp;</td><td style="background-color:#363636;color:#fff;border-bottom:solid 1px #ccc;text-transform:uppercase;text-align:center;font-size:18px">Informations envoyées</td></tr>
                        </thead>
                        <?php
                        foreach ($data as $item) {
                            echo('<tr valign="top">');
                            echo('<td style="background-color:#E0E0E0;font-style:italic;text-align:right;border-left:solid 1px #ccc;border-bottom:solid 1px #ccc;">' . $item['label'] . ':</td>');
                            echo('<td style="font-weight:bold;border-right:solid 1px #ccc;border-bottom:solid 1px #ccc;">' . $item['value'] . '</td>');
                            echo('</tr>');
                        }
                        ?>
                    </table>

                    <h3>Vous êtes à un pas de clore cette vente.<br />
                    CONTACTEZ CETTE PERSONNE SANS TARDER!</h3>
                    <p>Ce prospect a été généré par votre service <?php echo(SI_NAME) ?>.</p>
                </td>
            </tr>
        </table>
    </body>
</html>

--PHP-alt-<?php echo($random_hash) ?>--
<?php
